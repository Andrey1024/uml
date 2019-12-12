package ru.avlasov.ast;

import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.TypeDeclaration;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;
import com.github.javaparser.symbolsolver.utils.SymbolSolverCollectionStrategy;
import com.github.javaparser.utils.ProjectRoot;
import com.github.javaparser.utils.SourceRoot;
import org.apache.commons.lang3.StringUtils;
import ru.avlasov.ast.nodes.*;
import ru.avlasov.ast.visitors.ClassExtractor;
import ru.avlasov.ast.visitors.PackageExtractor;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ProjectParser {
    private ProjectRoot projectRoot;
    private Path projectPath;
    private String projectName;


    public ProjectParser(Path projectPath, String projectName) {
        ParserConfiguration configuration = new ParserConfiguration();
        configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.CURRENT);
        this.projectPath = projectPath;
        this.projectName = projectName;

        this.projectRoot = new SymbolSolverCollectionStrategy(configuration).collect(projectPath);
    }

    public Project parse() {
        return new Project(projectRoot.getSourceRoots().stream()
                .map(this::parseSourceRoot).collect(Collectors.toList()), this.projectName);
    }

    private PackageNode parseSourceRoot(SourceRoot sourceRoot) {
        Map<String, List<ResolvedReferenceTypeDeclaration>> types = new HashMap<>();
        Map<String, PackageTree> packageMap = new HashMap<>();

        List<ParseResult<CompilationUnit>> results = null;
        try {
            results = sourceRoot.tryToParse();
        } catch (IOException e) {
            e.printStackTrace();
        }

        results.stream().map(ParseResult::getResult).map(Optional::get)
                .forEach(compilationUnit -> compilationUnit.accept(new ClassExtractor(), types));
        results.stream().map(ParseResult::getResult).map(Optional::get)
                .forEach(compilationUnit -> compilationUnit.accept(new PackageExtractor(), packageMap));
//        PackageTree rootPack = new PackageTree(types.keySet().stream()
//                .distinct().reduce((s1, s2) -> StringUtils.getCommonPrefix(s1, s2).replaceAll("\\.$", "")).orElse(""));
        PackageTree rootPack = new PackageTree(StringUtils.difference(this.projectRoot.getRoot().toString(), sourceRoot.getRoot().toString()));
        rootPack.getChildren().addAll(packageMap.values().stream().filter(packageTree -> packageTree.getParent() == null)
                .peek(child -> child.setParent(rootPack)).collect(Collectors.toList()));
        packageMap.put(rootPack.getName(), rootPack);
        return PackageNode.createPackage(rootPack, types);
    }

}
