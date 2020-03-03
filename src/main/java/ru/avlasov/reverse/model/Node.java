package ru.avlasov.reverse.model;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

public class Node {
    private String type;
    private String name;
    private String fullPath;
    private Integer lifeSpan = 0;

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

    public List<String> collectPaths() {
        return Arrays.asList(this.fullPath);
    }

    public void computeLifeSpan(List<Set<String>> versions) {
        Iterator<Set<String>> iterator = versions.iterator();
        boolean stop = false;
        while (iterator.hasNext() && !stop) {
            if (iterator.next().contains(this.fullPath)) {
                this.lifeSpan++;
            } else {
                stop = true;
            }
        }
    }

    public Node() {

    }
}
