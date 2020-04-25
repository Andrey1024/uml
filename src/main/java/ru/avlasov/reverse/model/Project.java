package ru.avlasov.reverse.model;

import java.util.List;

public class Project {
    private String sourceRoot;
    private String commit;
    private List<Element> data;

    public String getSourceRoot() {
        return sourceRoot;
    }

    public void setSourceRoot(String sourceRoot) {
        this.sourceRoot = sourceRoot;
    }

    public String getCommit() {
        return commit;
    }

    public void setCommit(String commit) {
        this.commit = commit;
    }

    public List<Element> getData() {
        return data;
    }

    public void setData(List<Element> data) {
        this.data = data;
    }

    public Project(String sourceRoot, String version, List<Element> data) {
        this.sourceRoot = sourceRoot;
        this.commit = version;
        this.data = data;
    }
}
