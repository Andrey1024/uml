package ru.avlasov.uml.model;

import java.util.ArrayList;
import java.util.List;

public class Node {
    protected String type;
    private Point location;
    private String color;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Point getLocation() {
        return location;
    }

    public void setLocation(Point location) {
        this.location = location;
    }

    public List<Node> children = new ArrayList<>();

    public Node() {

    }

    public void addChild(Node node) {
        this.children.add(node);
    }
}
