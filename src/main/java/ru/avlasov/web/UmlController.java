package ru.avlasov.web;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.web.bind.annotation.*;
import ru.avlasov.ProjectParser;
import ru.avlasov.reverse.model.Project;
import ru.avlasov.web.responses.Commit;
import ru.avlasov.web.responses.CreateRequest;
import ru.avlasov.web.responses.RepositoryInfo;

import java.io.IOException;
import java.util.List;

@RestController
public class UmlController {

    private final ProjectParser parser;

    public UmlController(ProjectParser parser) {
        this.parser = parser;
    }


    @GetMapping("/api/repository")
    public List<RepositoryInfo> getRepositories() {
        return parser.getRepositoryList();
    }

    @GetMapping("/api/repository/{name}")
    public List<Commit> openRepository(@PathVariable String name) throws IOException {
        return parser.getCommits(name.toLowerCase());
    }

    @DeleteMapping("/api/repository/{name}")
    public void removeRepository(@PathVariable String name) {
        parser.removeRepository(name.toLowerCase());
    }

    @PostMapping("/api/repository")
    public RepositoryInfo addRepository(@RequestBody CreateRequest body) throws GitAPIException {
        parser.cloneRepository(body.getUrl(), body.getName().toLowerCase());
        return new RepositoryInfo(body.getName().toLowerCase(), body.getUrl());
    }

    @GetMapping("/api/repository/{name}/{commit}")
    public Project getVersion(@PathVariable String commit, @PathVariable String name) throws IOException {
        return parser.parseCommit(name.toLowerCase(), commit);
    }
}
