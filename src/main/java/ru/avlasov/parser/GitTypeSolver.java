package ru.avlasov.parser;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;
import com.github.javaparser.symbolsolver.javaparser.Navigator;
import com.github.javaparser.symbolsolver.javaparsermodel.JavaParserFacade;
import com.github.javaparser.symbolsolver.model.resolution.SymbolReference;
import com.github.javaparser.symbolsolver.model.resolution.TypeSolver;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

public class GitTypeSolver implements TypeSolver {
    private final String srcDir;
    private final Map<String, CompilationUnit> compilationUnitMap;

    private TypeSolver parent;

    private final Cache<String, Optional<CompilationUnit>> parsedFiles = CacheBuilder.newBuilder().softValues().build();
    private final Cache<String, List<CompilationUnit>> parsedDirectories = CacheBuilder.newBuilder().softValues().build();
    private final Cache<String, SymbolReference<ResolvedReferenceTypeDeclaration>> foundTypes = CacheBuilder.newBuilder().softValues().build();

    public GitTypeSolver(String srcDir, Map<String, CompilationUnit> compilationUnitMap) {
        this.srcDir = srcDir;
        this.compilationUnitMap = compilationUnitMap;
    }

    @Override
    public String toString() {
        return "JavaParserTypeSolver{" +
                "srcDir=" + srcDir +
                ", parent=" + parent +
                '}';
    }

    @Override
    public TypeSolver getParent() {
        return parent;
    }

    @Override
    public void setParent(TypeSolver parent) {
        this.parent = parent;
    }

    private Optional<CompilationUnit> parse(String srcFile) {
        try {
            return parsedFiles.get(srcFile, () -> {
                if (!compilationUnitMap.containsKey(srcFile)) {
                    return Optional.empty();
                }
                return Optional.of(compilationUnitMap.get(srcFile));
            });
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Note that this parse only files directly contained in this directory.
     * It does not traverse recursively all children directory.
     * //
     */
//    private List<CompilationUnit> parseDirectory(Path srcDirectory) {
//        return parseDirectory(srcDirectory, false);
//    }
//
//    private List<CompilationUnit> parseDirectoryRecursively(Path srcDirectory) {
//        return parseDirectory(srcDirectory, true);
//    }
//
    private List<CompilationUnit> parseDirectory(String srcDirectory) {
        try {
            return parsedDirectories.get(srcDirectory, () -> {
                List<CompilationUnit> units = new ArrayList<>();
                compilationUnitMap.keySet().stream().filter(key -> key.startsWith(srcDirectory)).forEach(file -> {
                    parse(file).ifPresent(units::add);
                });
                return units;
            });
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public SymbolReference<ResolvedReferenceTypeDeclaration> tryToSolveType(String name) {
        // TODO support enums
        // TODO support interfaces
        try {
            return foundTypes.get(name, () -> {
                SymbolReference<ResolvedReferenceTypeDeclaration> result = tryToSolveTypeUncached(name);
                if (result.isSolved()) {
                    return SymbolReference.solved(result.getCorrespondingDeclaration());
                }
                return result;
            });
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private SymbolReference<ResolvedReferenceTypeDeclaration> tryToSolveTypeUncached(String name) {
        String[] nameElements = name.split("\\.");

        for (int i = nameElements.length; i > 0; i--) {
            StringBuilder filePath = new StringBuilder(srcDir);
            for (int j = 0; j < i; j++) {
                filePath.append("/")
                        .append(nameElements[j]);
            }
            filePath.append(".java");

            StringBuilder typeName = new StringBuilder();
            for (int j = i - 1; j < nameElements.length; j++) {
                if (j != i - 1) {
                    typeName.append(".");
                }
                typeName.append(nameElements[j]);
            }

            // As an optimization we first try to look in the canonical position where we expect to find the file
            {
                Optional<CompilationUnit> compilationUnit = parse(filePath.toString());
                if (compilationUnit.isPresent()) {
                    Optional<com.github.javaparser.ast.body.TypeDeclaration<?>> astTypeDeclaration = Navigator.findType(compilationUnit.get(), typeName.toString());
                    if (astTypeDeclaration.isPresent()) {
                        return SymbolReference.solved(JavaParserFacade.get(this).getTypeDeclaration(astTypeDeclaration.get()));
                    }
                }
            }

            // If this is not possible we parse all files
            // We try just in the same package, for classes defined in a file not named as the class itself
            {
                List<CompilationUnit> compilationUnits = parseDirectory(filePath.substring(0, filePath.lastIndexOf("/") - 1));
                for (CompilationUnit compilationUnit : compilationUnits) {
                    Optional<com.github.javaparser.ast.body.TypeDeclaration<?>> astTypeDeclaration = Navigator.findType(compilationUnit, typeName.toString());
                    if (astTypeDeclaration.isPresent()) {
                        return SymbolReference.solved(JavaParserFacade.get(this).getTypeDeclaration(astTypeDeclaration.get()));
                    }
                }
            }
        }

        return SymbolReference.unsolved(ResolvedReferenceTypeDeclaration.class);
    }
}
