package ru.avlasov.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.avlasov.uml.Reverser;
import ru.avlasov.uml.model.ContainerNode;

@RestController
public class UmlController {

    @Autowired
    private Reverser reverser;

    @GetMapping("api/model")
    public ContainerNode getModel() {
        return this.reverser.reverse();
    }

}
