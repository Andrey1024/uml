package ru.avlasov.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.avlasov.uml.Reverser;
import ru.avlasov.uml.model.ProjectStructure;

import java.util.*;

@RestController
public class UmlController {

    @Autowired
    private Reverser reverser;

    @GetMapping("api/model")
    public List<ProjectStructure> getModel() {
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
}
