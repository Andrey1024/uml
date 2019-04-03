package ru.avlasov.uml.model;

import java.util.ArrayList;
import java.util.List;

public class ContainerNode extends Node {

    public List<Node> children = new ArrayList<>();


    public void addChild(Node node) {
        this.children.add(node);
    }

    public ContainerNode() {
        super();
        this.setType("CONTAINER");
    }
}
