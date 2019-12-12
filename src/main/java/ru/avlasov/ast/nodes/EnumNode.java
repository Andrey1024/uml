package ru.avlasov.ast.nodes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.resolution.declarations.ResolvedEnumDeclaration;

public class EnumNode extends TypeNode {
    private final String type = "ENUM";

    @Override
    public String getType() {
        return type;
    }

    public EnumNode(ResolvedEnumDeclaration declaration) {
        super(declaration);
    }
}
