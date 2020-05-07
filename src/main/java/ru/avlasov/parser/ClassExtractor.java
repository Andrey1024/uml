package ru.avlasov.parser;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import com.github.javaparser.resolution.UnsolvedSymbolException;
import com.github.javaparser.resolution.declarations.ResolvedEnumDeclaration;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;
import com.github.javaparser.resolution.types.ResolvedReferenceType;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;
import ru.avlasov.parser.model.ClassNode;
import ru.avlasov.parser.model.Element;
import ru.avlasov.parser.model.EnumNode;
import ru.avlasov.parser.model.InterfaceNode;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ClassExtractor {
    private final ParserConfiguration configuration;
    private final CombinedTypeSolver typeSolver;
    private final Map<String, Map<String, CompilationUnit>> compilationUnitMap = new HashMap<>();

    public ClassExtractor() {
        configuration = new ParserConfiguration();
        typeSolver = new CombinedTypeSolver(new ReflectionTypeSolver(false));
        configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.CURRENT);
        configuration.setSymbolResolver(new JavaSymbolSolver(typeSolver));
    }

    public void parseFile(String filePath, InputStream stream) {
        ParseResult<CompilationUnit> parseResult = new JavaParser(configuration).parse(stream);
        if (parseResult.getResult().isPresent()) {
            CompilationUnit cu = parseResult.getResult().get();
            String sourceRoot = getSourceRoot(filePath, cu.getPackageDeclaration().get().getNameAsString());
            if (!compilationUnitMap.containsKey(sourceRoot)) {
                compilationUnitMap.put(sourceRoot, new HashMap<>());
            }
            compilationUnitMap.get(sourceRoot).put(filePath, cu);
        }
    }

    public List<Element> getElements() {
        for (String sourceRoot : compilationUnitMap.keySet()) {
            typeSolver.add(new GitTypeSolver(sourceRoot, compilationUnitMap.get(sourceRoot)));
        }
        List<Element> elements = new ArrayList<>();
        for (String sourceRoot : compilationUnitMap.keySet()) {
            Map<String, CompilationUnit> cus = compilationUnitMap.get(sourceRoot);
            for (String file : cus.keySet()) {
                CompilationUnit cu = cus.get(file);
                for (Element element: Stream.concat(getClasses(cu).stream(), getEnums(cu).stream()).collect(Collectors.toList())) {
                    element.setSourceRoot(sourceRoot);
                    element.setFilePath(file);
                    elements.add(element);
                }
            }
        }
        return elements;
    }

    private String getSourceRoot(String path, String packageName) {
        String packagePath = packageName.replace('.', '/');
        if (path.contains(packagePath)) {
            return path.substring(0, path.lastIndexOf(packagePath) - 1);
        } else {
            return "";
        }
    }

    private List<Element>  getClasses(CompilationUnit cu) {
        List<Element> elements = new ArrayList<>();
        new VoidVisitorAdapter<Object>() {
            @Override
            public void visit(ClassOrInterfaceDeclaration n, Object arg) {
                ResolvedReferenceTypeDeclaration type = n.resolve();
                if (type.getPackageName().isEmpty()) return;

                InterfaceNode node = null;
                if (type.isInterface()) {
                    node = new InterfaceNode();
                } else if (type.isClass()) {
                    node = new ClassNode();
                }

                List<String> extendedTypes = new ArrayList<>();
                for (ClassOrInterfaceType extended : n.getExtendedTypes()) {
                    try {
                        ResolvedReferenceType ext = extended.resolve();
                        extendedTypes.add(ext.getQualifiedName());
                    } catch (UnsolvedSymbolException e) {
                        System.out.println("");
                    }
                }
                List<String> implementedTypes = new ArrayList<>();
                for (ClassOrInterfaceType implemented: n.getImplementedTypes()) {
                    try {
                        ResolvedReferenceType implementedType = implemented.resolve();
                        implementedTypes.add(implementedType.getQualifiedName());
                    } catch (UnsolvedSymbolException e) {
                        implementedTypes.add(implemented.getNameAsString());
                    }
                }
                if (node != null) {
                    node.setExtendedTypes(extendedTypes);
                    node.setImplementedTypes(implementedTypes);
                    node.setName(type.getName());
                    node.setParentPackage(type.getPackageName());
                    node.setFullPath(type.getQualifiedName());
                    if (n.getRange().isPresent()) {
                        node.setNumberOfLines(n.getRange().get().end.line - n.getRange().get().begin.line);
                    }
                    setFields(n, node);
                    setMethods(n, node);
                }
                elements.add(node);
                super.visit(n, arg);
            }
        }.visit(cu, null);
        return elements;
    }

    private void setFields(ClassOrInterfaceDeclaration clazz, InterfaceNode attributeOwner) {
        new VoidVisitorAdapter<Object>() {
            @Override
            public void visit(FieldDeclaration n, Object arg) {
                attributeOwner.setAttributesCount(attributeOwner.getAttributesCount() + n.getVariables().size());
            }
        }.visit(clazz, null);
    }

    private void setMethods(ClassOrInterfaceDeclaration clazz, InterfaceNode operationOwner) {
        new VoidVisitorAdapter<Object>() {
            @Override
            public void visit(MethodDeclaration n, Object arg) {
                operationOwner.setMethodsCount(operationOwner.getMethodsCount() + 1);
            }
        }.visit(clazz, null);
    }

    private List<Element> getEnums(CompilationUnit cu) {
        List<Element> elements = new ArrayList<>();
        new VoidVisitorAdapter<Object>() {
            @Override
            public void visit(EnumDeclaration n, Object arg) {
                ResolvedEnumDeclaration type = n.resolve();
                EnumNode enumNode = new EnumNode();
                enumNode.setName(type.getName());
                enumNode.setFullPath(type.getQualifiedName());
                enumNode.setParentPackage(type.getPackageName());
                if (n.getRange().isPresent()) {
                    enumNode.setNumberOfLines(n.getRange().get().end.line - n.getRange().get().begin.line);
                }
                elements.add(enumNode);
            }
        }.visit(cu, null);
        return elements;
    }
}
