package ru.avlasov.ast.nodes;

import java.util.ArrayList;
import java.util.List;

public class Project {
    private List<PackageNode> data = new ArrayList<>();
    private String version = "0.0";
    private String name;

    public Project(String name) {
        this.name = name;
    }

    public void addPackage(PackageNode node) {
        this.data.add(node);
    }

    public List<PackageNode> getData() {
        return data;
    }

    public Project(List<PackageNode> packages, String name) {
        this.data = packages;
        this.name = name;
    }
}
