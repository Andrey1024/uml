package ru.avlasov.ast;

import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.symbolsolver.utils.SymbolSolverCollectionStrategy;
import com.github.javaparser.utils.ProjectRoot;
import com.github.javaparser.utils.SourceRoot;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.uml2.uml.Model;
import org.eclipse.uml2.uml.UMLFactory;
import ru.avlasov.ast.visitors.UmlGenerator;

import java.io.File;
import java.io.IOException;
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

    public Model parse() throws IOException {
        Model result = UMLFactory.eINSTANCE.createModel();
        projectRoot.getSourceRoots()
                .forEach(sourceRoot -> parseSourceRoot(sourceRoot, result));
        git.close();
        FileUtils.deleteDirectory(git.getRepository().getWorkTree());
        return result;
    }

    private void parseSourceRoot(SourceRoot sourceRoot, Model model) {
        List<CompilationUnit> results = null;
        try {
            results = sourceRoot.tryToParse().stream().map(ParseResult::getResult)
                    .filter(Optional::isPresent).map(Optional::get).collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }

        UmlGenerator uml = new UmlGenerator(results, model);

    }

}
