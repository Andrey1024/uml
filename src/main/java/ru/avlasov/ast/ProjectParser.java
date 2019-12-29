package ru.avlasov.ast;

import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.symbolsolver.utils.SymbolSolverCollectionStrategy;
import com.github.javaparser.utils.ProjectRoot;
import com.github.javaparser.utils.SourceRoot;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import ru.avlasov.ast.nodes.AbstractNode;
import ru.avlasov.ast.nodes.PackageNode;
import ru.avlasov.ast.nodes.Project;
import ru.avlasov.ast.visitors.ClassExtractor;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class ProjectParser {
    private ProjectRoot projectRoot;
    private String repositoryUrl;
    private String projectName;
    private Git git;


    public ProjectParser(String repositoryUrl, String projectName) throws IOException, GitAPIException {
        ParserConfiguration configuration = new ParserConfiguration();
        configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.CURRENT);
        this.repositoryUrl = repositoryUrl;
        this.projectName = projectName;

        File repositoryDir = File.createTempFile("remote", "");
        repositoryDir.delete();
        git = Git.cloneRepository().setURI(repositoryUrl).setDirectory(repositoryDir).call();

        this.projectRoot = new SymbolSolverCollectionStrategy(configuration)
                .collect(git.getRepository().getWorkTree().toPath());
    }

    public Project parse() throws IOException {
        Project result = new Project(projectRoot.getSourceRoots().stream()
                .map(this::parseSourceRoot).collect(Collectors.toList()), this.projectName);
        git.close();
        FileUtils.deleteDirectory(git.getRepository().getWorkTree());
        return result;
    }

    private PackageNode parseSourceRoot(SourceRoot sourceRoot) {
        List<AbstractNode> types = new ArrayList<>();

        List<ParseResult<CompilationUnit>> results = null;
        try {
            results = sourceRoot.tryToParse();
        } catch (IOException e) {
            e.printStackTrace();
        }

        results.stream().map(ParseResult::getResult).filter(Optional::isPresent).map(Optional::get)
                .forEach(compilationUnit -> compilationUnit.accept(new ClassExtractor(), types));
        return new PackageNode(
                StringUtils.difference(this.projectRoot.getRoot().toString(), sourceRoot.getRoot().toString()).replaceAll("^\\\\", ""),
                types
        );
    }

}
