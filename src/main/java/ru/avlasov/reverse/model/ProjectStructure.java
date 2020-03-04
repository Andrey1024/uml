package ru.avlasov.reverse.model;

import java.util.List;

public class ProjectStructure {
    private String name;
    private String version;
    private List<Node> data;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public List<Node> getData() {
        return data;
    }

    public void setData(List<Node> data) {
        this.data = data;
    }

    public ProjectStructure(String name, String version, List<Node> data) {
        this.name = name;
        this.version = version;
        this.data = data;
    }
}
