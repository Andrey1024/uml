package ru.avlasov.reverse.model;

import java.util.List;

public class Project {
    private List<String> sourceRoots;
    private List<Element> data;

    public List<String> getSourceRoots() {
        return sourceRoots;
    }

    public void setSourceRoots(List<String> sourceRoots) {
        this.sourceRoots = sourceRoots;
    }

    public List<Element> getData() {
        return data;
    }

    public void setData(List<Element> data) {
        this.data = data;
    }

    public Project(List<Element> data, List<String> sourceRoots) {
        this.data = data;
        this.sourceRoots = sourceRoots;
    }
}
