package ru.avlasov.web;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.uml2.uml.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.avlasov.ast.ProjectParser;
import ru.avlasov.ast.ResourceUtil;
import ru.avlasov.reverse.Reverser;
import ru.avlasov.reverse.model.ProjectStructure;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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
        ProjectParser parser = new ProjectParser("https://github.com/ReactiveX/RxJava.git");
        List<ProjectStructure> result = new ArrayList<>();
        List<String> tags = parser.listTags();
        tags = tags.subList(tags.size() - Math.min(5, tags.size()), tags.size());
        for(String tag: tags) {
            Model model = null;
            try {
                model = ResourceUtil.loadModel("Rx", tag);
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
            if (model == null) {
                model = parser.parseTag(tag);
                ResourceUtil.saveModel(model, "Rx", tag);
            }
            result.add(new ProjectStructure("Rx", tag, this.reverser.reverse(model)));
        }
        parser.clean();
        return result;
    }

}
