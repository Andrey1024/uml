package ru.avlasov.web;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.avlasov.ast.ProjectParser;
import ru.avlasov.ast.nodes.Project;

import java.io.IOException;

@RestController
public class UmlController {

    @GetMapping("api/model")
    public Project getModel() throws IOException, GitAPIException {
        return new ProjectParser("https://github.com/alibaba/Alink.git", "UML").parse();
    }
}
