package ru.avlasov.uml.model;

public class Node {
    private String type;
    private String name;

    public String getType() {
        return type;
    }

    protected void setType(String type) {
        this.type = type;
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
