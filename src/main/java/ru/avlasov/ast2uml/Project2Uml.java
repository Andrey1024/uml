package ru.avlasov.ast2uml;

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
import org.eclipse.uml2.uml.Model;
import org.eclipse.uml2.uml.Package;
import org.eclipse.uml2.uml.Type;
import org.eclipse.uml2.uml.UMLFactory;
import ru.avlasov.ast2uml.visitors.Class2UML;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

//import ru.avlasov.ast.nodes.AbstractNode;
//import ru.avlasov.ast.nodes.PackageNode;
//import ru.avlasov.ast.nodes.Project;
//import ru.avlasov.ast.visitors.ClassExtractor;

public class Project2Uml {
    private ProjectRoot projectRoot;
    private String repositoryUrl;
    private String projectName;
    private Git git;

    public Project2Uml(String repositoryUrl, String projectName) throws IOException, GitAPIException {
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
        projectRoot.getSourceRoots()
                .stream()
                .map(this::parseSourceRoot)
                .collect(Collectors.toList());

        Model model = UMLFactory.eINSTANCE.createModel();
        model.setName("Sample");
        git.close();
        FileUtils.deleteDirectory(git.getRepository().getWorkTree());
        return model;
    }

    private Package parseSourceRoot(SourceRoot sourceRoot) {
        List<Type> types = new ArrayList<>();

        List<ParseResult<CompilationUnit>> results = null;
        try {
            results = sourceRoot.tryToParse();
        } catch (IOException e) {
            e.printStackTrace();
        }

        results.stream()
                .map(ParseResult::getResult)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .forEach(compilationUnit -> compilationUnit.accept(new Class2UML(), types));

        String strProjectRoot = projectRoot.getRoot().toString();
        String strSourceRoot = sourceRoot.getRoot().toString();
        String sourcePath = StringUtils.difference(strProjectRoot, strSourceRoot).replaceAll("^\\\\", "");

        Model model = UMLFactory.eINSTANCE.createModel();
        return model; // (sourcePath, types);
    }
}
