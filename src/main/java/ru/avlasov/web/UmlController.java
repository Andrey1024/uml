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
        List<ProjectStructure> result = Arrays.asList(
                new ProjectStructure("Spring", "2.0.8", this.reverser.reverse("lib/spring-core-2.0.8.jar")),
                new ProjectStructure("Spring", "2.5", this.reverser.reverse("lib/spring-core-2.5.jar")),
                new ProjectStructure("Spring", "2.5.1", this.reverser.reverse("lib/spring-core-2.5.1.jar")),
                new ProjectStructure("Spring", "2.5.2", this.reverser.reverse("lib/spring-core-2.5.2.jar")),
                new ProjectStructure("Spring", "2.5.3", this.reverser.reverse("lib/spring-core-2.5.3.jar")),
                new ProjectStructure("Spring", "2.5.4", this.reverser.reverse("lib/spring-core-2.5.4.jar")),
                new ProjectStructure("Spring", "2.5.6", this.reverser.reverse("lib/spring-core-2.5.6.jar")),
                new ProjectStructure("Spring", "3.0.7", this.reverser.reverse("lib/spring-core-3.0.7.RELEASE.jar")),
                new ProjectStructure("Spring", "3.2.18", this.reverser.reverse("lib/spring-core-3.2.18.RELEASE.jar"))
        );
        Iterator<ProjectStructure> iterator = result.iterator();
        List<Set<String>> previous = new ArrayList<>();
        while (iterator.hasNext()) {
            ProjectStructure cur = iterator.next();
            if (!previous.isEmpty()) {
                cur.getData().computeLifeSpan(previous);
            }
            previous.add(0, new HashSet<>(cur.getData().collectPaths()));
        }
        return result;
    }

    @GetMapping("api/model")
    public Project getModel() throws IOException, GitAPIException {
        return new ProjectParser("https://github.com/alibaba/Alink.git", "UML").parse();
    }

}
