package ru.avlasov.ast.nodes;

import com.github.javaparser.ast.body.TypeDeclaration;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class PackageNode extends AbstractNode {
    private final String type = "PACKAGE";

    private List<AbstractNode> children = new ArrayList<>();

    public List<AbstractNode> getChildren() {
        return children;
    }

    public String getType() {
        return type;
    }

    private PackageNode(String name, List<AbstractNode> children) {
        this.setName(name);
        this.setFullPath(name);
        this.children = children;
    }

    public static PackageNode createPackage(PackageTree packageTree, Map<String, List<ResolvedReferenceTypeDeclaration>> nodes) {
        Stream<AbstractNode> childPackages = packageTree.getChildren().stream()
                .map(child -> PackageNode.createPackage(child, nodes));
        Stream<AbstractNode> childTypes = nodes.getOrDefault(packageTree.getName(), new ArrayList<>()).stream().map(type -> {
            if (type.isInterface()) {
                return new InterfaceNode(type.asInterface());
            } else if (type.isClass()) {
                return new ClassNode(type.asClass());
            } else if (type.isEnum()) {
                return new EnumNode(type.asEnum());
            }
            return null;
        });
        return new PackageNode(packageTree.getName(), Stream.concat(childPackages, childTypes).collect(Collectors.toList()));
    }
}
