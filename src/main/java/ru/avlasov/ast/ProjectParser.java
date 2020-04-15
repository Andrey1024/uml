package ru.avlasov.ast;

import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.symbolsolver.utils.SymbolSolverCollectionStrategy;
import com.github.javaparser.utils.SourceRoot;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.uml2.uml.Model;
import org.eclipse.uml2.uml.UMLFactory;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class ProjectParser {
    private Git git = null;
    private String url;


    public ProjectParser(String repositoryUrl) {
        this.url = repositoryUrl;
    }

    public List<String> listTags() {
        Collection<Ref> tagList = null;
        try {
            tagList = Git.lsRemoteRepository().setTags(true).setRemote(url).call();
        } catch (GitAPIException e) {
            e.printStackTrace();
        }
        assert tagList != null;
        return tagList.stream().map(Ref::getName).map(name -> name.substring("refs/tags/".length()))
                .collect(Collectors.toList());
    }

    public Model parseTag(String tag) throws IOException, GitAPIException {
        Model result = UMLFactory.eINSTANCE.createModel();

        if (git == null) {
            File repositoryDir = File.createTempFile("remote", "");
            repositoryDir.delete();
            git = Git.cloneRepository().setURI(url).setDirectory(repositoryDir).call();
        }

        git.checkout().setName("refs/tags/" + tag).call();
        ParserConfiguration configuration = new ParserConfiguration();
        configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.CURRENT);

        new SymbolSolverCollectionStrategy(configuration)
                .collect(git.getRepository().getWorkTree().toPath()).getSourceRoots()
                .forEach(sourceRoot -> parseSourceRoot(sourceRoot, result));
        return result;
    }

    public void clean() throws IOException {
        git.close();
        FileUtils.deleteDirectory(git.getRepository().getWorkTree());
    }

    private void parseSourceRoot(SourceRoot sourceRoot, Model model) {
        List<CompilationUnit> results = null;
        results = sourceRoot.tryToParseParallelized().stream().map(ParseResult::getResult)
                .filter(Optional::isPresent).map(Optional::get).collect(Collectors.toList());

        UmlVisitor uml = new UmlVisitor(model);
        results.forEach(uml::ParseToModel);
    }

}
