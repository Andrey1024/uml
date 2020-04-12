package ru.avlasov.web;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.avlasov.ast.ProjectParser;
import ru.avlasov.ast.nodes.Project;
import ru.avlasov.reverse.Reverser;
import ru.avlasov.reverse.model.ProjectStructure;

import java.io.IOException;
import java.util.*;

@RestController
public class UmlController {

    @Autowired
    private Reverser reverser;

    @GetMapping("api/reverse")
    public List<ProjectStructure> gerReversedModel() {
        return Arrays.asList(
                new ProjectStructure("Spring", "2.0.8", this.reverser.reverse("lib/spring-core-2.0.8.jar")),
                new ProjectStructure("Spring", "2.5", this.reverser.reverse("lib/spring-core-2.5.jar")),
                new ProjectStructure("Spring", "2.5.1", this.reverser.reverse("lib/spring-core-2.5.1.jar")),
                new ProjectStructure("Spring", "2.5.2", this.reverser.reverse("lib/spring-core-2.5.2.jar")),
                new ProjectStructure("Spring", "2.5.3", this.reverser.reverse("lib/spring-core-2.5.3.jar")),
                new ProjectStructure("Spring", "2.5.4", this.reverser.reverse("lib/spring-core-2.5.4.jar")),
                new ProjectStructure("Spring", "2.5.6", this.reverser.reverse("lib/spring-core-2.5.6.jar"))
        );
    }

    @GetMapping("api/model")
    public List<ProjectStructure> getModel() throws IOException, GitAPIException {
        return Arrays.asList(new ProjectStructure("Alink", "0",
                this.reverser.reverse(new ProjectParser("https://github.com/alibaba/Alink.git", "UML").parse())));
    }

}
