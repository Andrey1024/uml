package ru.avlasov.ast.nodes;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.File;

public class AbstractNode {
    private final String type = "ABSTRACT";
    private Integer lifeSpan = 1;
    private String fullPath;

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public Integer getLifeSpan() {
        return lifeSpan;
    }

    public void setLifeSpan(Integer lifeSpan) {
        this.lifeSpan = lifeSpan;
    }

    public String getFullPath() {
        return fullPath;
    }

    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }

    public AbstractNode() {
    }

    public AbstractNode(String name) {
        setName(name);
    }
}
