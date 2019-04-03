package ru.avlasov.uml.model;

import java.util.ArrayList;
import java.util.List;

public class Node {
    protected String type;
    private String name;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Node() {

    }
}
