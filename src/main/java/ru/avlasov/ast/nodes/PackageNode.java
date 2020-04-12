package ru.avlasov.ast.nodes;

import java.util.ArrayList;
import java.util.List;

public class PackageNode {
    private String sourcePath;

    private List<AbstractNode> children;

    public List<AbstractNode> getChildren() {
        return children;
    }

    public String getSourcePath() {
        return sourcePath;
    }

    public void setSourcePath(String sourcePath) {
        this.sourcePath = sourcePath;
    }

    public PackageNode(String sourcePath, List<AbstractNode> children) {
        this.sourcePath = sourcePath;
        this.children = children;
    }

//    public static PackageNode createPackage(PackageTree packageTree, Map<String, List<ResolvedReferenceTypeDeclaration>> nodes) {
//        Stream<AbstractNode> childPackages = packageTree.getChildren().stream()
//                .map(child -> PackageNode.createPackage(child, nodes));
//        Stream<AbstractNode> childTypes = nodes.getOrDefault(packageTree.getName(), new ArrayList<>()).stream().map(type -> {
//            if (type.isInterface()) {
//                return new InterfaceNode(type.asInterface());
//            } else if (type.isClass()) {
//                return new ClassNode(type.asClass());
//            } else if (type.isEnum()) {
//                return new EnumNode(type.asEnum());
//            }
//            return null;
//        });
//        return new PackageNode(packageTree.getName(), Stream.concat(childPackages, childTypes).collect(Collectors.toList()));
//    }
}
