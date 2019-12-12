package ru.avlasov.ast.nodes;

import com.github.javaparser.ast.expr.Name;

import java.util.ArrayList;
import java.util.List;

public class PackageTree {
    private String name;
    private String qualifier;
    private List<PackageTree> children = new ArrayList<>();
    private PackageTree parent;

    public String getQualifier() {
        return qualifier;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<PackageTree> getChildren() {
        return children;
    }

    public PackageTree getParent() {
        return parent;
    }

    public void setParent(PackageTree parent) {
        this.parent = parent;
    }

    public PackageTree(Name name, PackageTree parent, List<PackageTree> children) {
        this(name);
        this.parent = parent;
        this.children = children;
    }

    public PackageTree(Name name) {
        this.name = name.asString();
        if (name.getQualifier().isPresent()) {
            this.qualifier = name.getQualifier().get().asString();
        } else {
            this.qualifier = "";
        }
    }

    public PackageTree(String name) {
        this.name = name;
        this.qualifier = "";
    }

    public PackageTree getRoot() {
        if (parent == null) {
            return this;
        } else {
            return parent.getRoot();
        }
    }
}
