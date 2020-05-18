package ru.avlasov.web;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.web.bind.annotation.*;
import ru.avlasov.RepositoryController;
import ru.avlasov.web.responses.Project;
import ru.avlasov.web.responses.Commit;
import ru.avlasov.web.responses.CreateRequest;
import ru.avlasov.web.responses.RepositoryInfo;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
public class UmlController {

    private final RepositoryController repositoryController;

    public UmlController(RepositoryController parser) {
        this.repositoryController = parser;
    }


    @GetMapping("/api/repository")
    public List<RepositoryInfo> getRepositories() {
        return repositoryController.getRepositoryList();
    }

    @GetMapping("/api/repository/{name}")
    public List<Commit> openRepository(@PathVariable String name) throws IOException {
        return repositoryController.getCommits(name.toLowerCase());
    }

    @DeleteMapping("/api/repository/{name}")
    public void removeRepository(@PathVariable String name) {
        repositoryController.removeRepository(name.toLowerCase());
    }

    @PostMapping("/api/repository")
    public RepositoryInfo addRepository(@RequestBody CreateRequest body) throws GitAPIException {
        repositoryController.cloneRepository(body.getUrl(), body.getName().toLowerCase());
        return new RepositoryInfo(body.getName().toLowerCase(), body.getUrl());
    }

    @GetMapping("/api/repository/{name}/{from}/{to}")
    public Map<String, List<String>> getChangesAuthors(@PathVariable String name, @PathVariable String from, @PathVariable String to) throws IOException {
        return repositoryController.countChangesBetweenCommits(name, from, to);
    }

    @GetMapping("/api/repository/{name}/{commit}")
    public Project getVersion(@PathVariable String commit, @PathVariable String name) throws IOException {
        return repositoryController.parseCommit(name.toLowerCase(), commit);
    }
}
