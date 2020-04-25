package ru.avlasov.reverse.model;

import java.util.ArrayList;
import java.util.List;

public class ContainerNode extends Element {

    public List<String> children = new ArrayList<>();


    public void addChild(String  node) {
        this.children.add(node);
    }

    public ContainerNode() {
        super();
        this.setType("CONTAINER");
    }

//    @Override
//    public List<String> collectPaths() {
//        List<String> result =  this.children.stream().map(Node::collectPaths).
//                flatMap(Collection::stream)
//                .collect(Collectors.toList());
//        result.add(this.getFullPath());
//        return result;
//    }
}
