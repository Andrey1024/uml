package ru.avlasov.ast.nodes;

import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;

public class TypeNode extends AbstractNode {
    private final String type = "TYPE";

    private String parentPackage;
    public String getType() {
        return type;
    }

    public String getParentPackage() {
        return parentPackage;
    }

    public void setParentPackage(String parentPackage) {
        this.parentPackage = parentPackage;
    }

    public TypeNode(ResolvedReferenceTypeDeclaration declaration) {
        setParentPackage(declaration.getPackageName());
        setFullPath(declaration.getQualifiedName());
        setName(declaration.getName());
    }
}
