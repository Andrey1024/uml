package ru.avlasov.web;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.web.bind.annotation.*;
import ru.avlasov.ProjectParser;
import ru.avlasov.reverse.model.Project;

import java.io.IOException;
import java.util.List;

@RestController
public class UmlController {

    private final ProjectParser parser;

    public UmlController(ProjectParser parser) {
        this.parser = parser;
    }

    @GetMapping("/api/repository")
    public List<String> getRepositories() {
        return parser.getRepositoryList();
    }

    @GetMapping("/api/repository/{name}")
    public List<Commit> openRepository(@PathVariable String name) throws IOException {
        return parser.getCommits(name.toLowerCase());
    }

    @PostMapping("/api/repository")
    public List<Commit> openRepository(@RequestBody String url, @RequestBody String name) throws GitAPIException, IOException {
        parser.cloneRepository(url, name.toLowerCase());
        return parser.getCommits(name);
    }

    @GetMapping("/api/repository/{name}/{commit}")
    public Project getVersion(@PathVariable String commit, @PathVariable String name) throws IOException {
        return parser.parseCommit(name.toLowerCase(), commit);
    }

    @RequestMapping({"/repositories/{name}"})
    public String index(@PathVariable String name) {
        return "forward:/static/index.html";
    }
}
