package ru.avlasov.uml.model;

import java.util.*;
import java.util.stream.Collectors;

public class ContainerNode extends Node {

    public List<Node> children = new ArrayList<>();


    public void addChild(Node node) {
        this.children.add(node);
    }

    public ContainerNode() {
        super();
        this.setType("CONTAINER");
    }

    @Override
    public List<String> collectPaths() {
        List<String> result =  this.children.stream().map(Node::collectPaths).
                flatMap(Collection::stream)
                .collect(Collectors.toList());
        result.add(this.getFullPath());
        return result;
    }

    @Override
    public void computeLifeSpan(List<Set<String>> versions) {
        super.computeLifeSpan(versions);
        children.stream().forEach(child -> child.computeLifeSpan(versions));
    }
}
