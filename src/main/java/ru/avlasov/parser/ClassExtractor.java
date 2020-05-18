package ru.avlasov.parser;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.TypeDeclaration;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import com.github.javaparser.resolution.UnsolvedSymbolException;
import com.github.javaparser.resolution.declarations.*;
import com.github.javaparser.resolution.types.ResolvedType;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;
import ru.avlasov.parser.model.*;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            typeSolver.add(new ParsedTypeSolver(sourceRoot, compilationUnitMap.get(sourceRoot)));
        }
        List<Element> elements = new ArrayList<>();
        for (String sourceRoot : compilationUnitMap.keySet()) {
            Map<String, CompilationUnit> cus = compilationUnitMap.get(sourceRoot);
            for (String file : cus.keySet()) {
                CompilationUnit cu = cus.get(file);
                for (Element element : getAllElements(cu)) {
                    if (element.getType().equals("CLASS")
                            || element.getType().equals("INTERFACE")
                            || element.getType().equals("ENUM")) {
                        ((TypeNode) element).setSourceRoot(sourceRoot);
                        ((TypeNode) element).setFilePath(file);
                    }
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

    private List<Element> getAllElements(CompilationUnit cu) {
        List<Element> elements = new ArrayList<>();
        new VoidVisitorAdapter<Element>() {
            public void visit(TypeDeclaration<?> declaration) {
                Element element = createNode(declaration);
                if (element == null) return;
                if (declaration.getRange().isPresent())
                    element.setNumberOfLines(declaration.getRange().get().getLineCount());
                elements.add(element);
            }

            @Override
            public void visit(EnumDeclaration n, Element arg) {
                visit(n);
            }

            @Override
            public void visit(ClassOrInterfaceDeclaration n, Element arg) {
                Element node = createNode(n);
                if (node == null) return;
                if (n.getRange().isPresent()) node.setNumberOfLines(n.getRange().get().getLineCount());
                elements.add(node);
                super.visit(n, node);
            }

            @Override
            public void visit(MethodDeclaration n, Element arg) {
                if (arg == null) {
                    return;
                }
                Method node = createMethodNode(n);
                if (n.getRange().isPresent()) node.setNumberOfLines(n.getRange().get().getLineCount());
                node.setParentClass(arg.getFullPath());
                node.setFullPath(arg.getFullPath() + "." + node.getName());
                ((InterfaceNode) arg).getMethods().add(node.getFullPath());
                elements.add(node);
            }
        }.visit(cu, null);
        return elements;
    }


    private Element createNode(TypeDeclaration<?> declaration) {
        ResolvedReferenceTypeDeclaration resolved = declaration.resolve();
        if (declaration.isEnumDeclaration()) {
            return createEnumNode(declaration.asEnumDeclaration());
        } else if (resolved.isClass()) {
            return createClassNode(declaration.asClassOrInterfaceDeclaration());
        } else if (resolved.isInterface()) {
            return createInterfaceNode(declaration.asClassOrInterfaceDeclaration());
        }
        return null;
    }

    private ClassNode createClassNode(ClassOrInterfaceDeclaration declaration) {
        ResolvedClassDeclaration resolved = declaration.resolve().asClass();
        ClassNode node = new ClassNode();
        setSharedProperties(resolved, node);
        for (ClassOrInterfaceType impl : declaration.getImplementedTypes()) {
            try {
                node.getImplementedTypes().add(impl.resolve().getQualifiedName());
            } catch (UnsolvedSymbolException e) {
                node.getImplementedTypes().add(impl.getNameAsString());
            }
        }
        try {
            node.setSuperClass(resolved.getSuperClass().getQualifiedName());
        } catch (UnsolvedSymbolException e) {
            if (!declaration.getExtendedTypes().isEmpty()) {
                node.setSuperClass(declaration.getExtendedTypes(0).getNameAsString());
            }
        }
        node.setMethodsCount(declaration.getMethods().size());
        node.setAttributesCount(declaration.getFields().size());

        return node;
    }

    private InterfaceNode createInterfaceNode(ClassOrInterfaceDeclaration declaration) {
        ResolvedInterfaceDeclaration resolved = declaration.resolve().asInterface();
        InterfaceNode node = new InterfaceNode();
        setSharedProperties(resolved, node);
        for (ClassOrInterfaceType impl : declaration.getExtendedTypes()) {
            try {
                node.getImplementedTypes().add(impl.resolve().getQualifiedName());
            } catch (UnsolvedSymbolException e) {
                node.getImplementedTypes().add(impl.getNameAsString());
            }
        }
        node.setMethodsCount(declaration.getMethods().size());
        node.setAttributesCount(declaration.getFields().size());
        return node;
    }

    private EnumNode createEnumNode(EnumDeclaration declaration) {
        ResolvedEnumDeclaration resolved = declaration.resolve();
        EnumNode node = new EnumNode();
        setSharedProperties(resolved, node);
        node.setNumberOfConstants(resolved.getEnumConstants().size());
        return node;
    }

    private Method createMethodNode(MethodDeclaration method) {
        Method methodNode = new Method();
        methodNode.setName(method.getNameAsString());
        try {
            ResolvedMethodDeclaration resolved = method.resolve();
            for (ResolvedTypeParameterDeclaration parameter : resolved.getTypeParameters()) {
                methodNode.getParameterTypes().add(parameter.getQualifiedName());
            }

        } catch (UnsolvedSymbolException e) {
        }
        methodNode.setReturnType(method.getTypeAsString());
        return methodNode;
    }
//
//    private void setMethods(ClassOrInterfaceDeclaration declaration, InterfaceNode node) {
//        for(MethodDeclaration method: declaration.getMethods()) {
//            Method methodNode = new Method();
//            methodNode.setNumberOfLines(method.getRange().get().getLineCount());
//            methodNode.setName(method.getNameAsString());
//            try {
//                ResolvedMethodDeclaration resolved = method.resolve();
//                methodNode.setReturnType(resolved.getReturnType().describe());
//                for (ResolvedTypeParameterDeclaration parameter: resolved.getTypeParameters()) {
//                    methodNode.getParameterTypes().add(parameter.getQualifiedName());
//                }
//            } catch (UnsolvedSymbolException e) {
//                methodNode.setReturnType(method.getTypeAsString());
//            }
//            node.getMethods().add(methodNode);
//        }
//    }

    private void setSharedProperties(ResolvedReferenceTypeDeclaration declaration, TypeNode element) {
        element.setName(declaration.getName());
        element.setParentPackage(declaration.getPackageName());
        element.setFullPath(declaration.getQualifiedName());
    }
}
