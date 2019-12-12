package ru.avlasov.ast.nodes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.resolution.declarations.ResolvedInterfaceDeclaration;

public class InterfaceNode extends TypeNode {
    private final String type = "INTERFACE";


    public String getType() {
        return type;
    }

    public InterfaceNode(ResolvedInterfaceDeclaration declaration) {
        super(declaration);
    }
}
