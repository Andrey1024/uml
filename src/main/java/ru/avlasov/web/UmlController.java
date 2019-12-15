package ru.avlasov.web;

import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.avlasov.ast.ProjectParser;
import ru.avlasov.ast.nodes.Project;

import java.io.File;
import java.io.IOException;

@RestController
public class UmlController {

    @GetMapping("api/model")
    public Project getModel() throws IOException {
        String repoUrl = "https://github.com/Andrey1024/uml.git";

        File p = File.createTempFile("remote", "");
        p.delete();
        File r = null;
        Git git = null;
        try {
            git = Git.cloneRepository().setURI(repoUrl).setDirectory(p).call();
            r = git.getRepository().getWorkTree();
        } catch (GitAPIException e) {
            e.printStackTrace();
        }

        Project result = new ProjectParser(r.toPath(), "alibaba").parse();

        git.close();
        FileUtils.deleteDirectory(p);
        return result;
    }
}
