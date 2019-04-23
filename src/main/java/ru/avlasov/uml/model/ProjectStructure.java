package ru.avlasov.uml.model;

import java.util.List;

public class ProjectStructure {
    private String name;
    private String version;
    private ContainerNode data;

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

    public ContainerNode getData() {
        return data;
    }

    public void setData(ContainerNode data) {
        this.data = data;
    }

    public ProjectStructure(String name, String version, ContainerNode data) {
        this.name = name;
        this.version = version;
        this.data = data;
    }
}
