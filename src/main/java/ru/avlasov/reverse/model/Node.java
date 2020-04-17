package ru.avlasov.reverse.model;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

public class Node {
    private String type;
    private String name;
    private String fullPath;
    private String parentPackage;

    public String getParentPackage() {
        return parentPackage;
    }

    public void setParentPackage(String parentPackage) {
        this.parentPackage = parentPackage;
    }

    public String getFullPath() {
        return fullPath;
    }

    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }

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
