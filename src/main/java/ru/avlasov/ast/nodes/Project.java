package ru.avlasov.ast.nodes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Project {
    private List<PackageNode> data;
    private String version = "0.0";
    private String name;

    public Project(String name) {
        this.name = name;
    }

    public List<PackageNode> getData() {
        return data;
    }

    public Project(List<PackageNode> packages, String name) {
        this.data = packages;
        this.name = name;
    }
}
