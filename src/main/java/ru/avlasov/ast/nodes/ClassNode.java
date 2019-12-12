package ru.avlasov.ast.nodes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.resolution.UnsolvedSymbolException;
import com.github.javaparser.resolution.declarations.ResolvedClassDeclaration;
import com.github.javaparser.resolution.declarations.ResolvedFieldDeclaration;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;
import com.github.javaparser.resolution.declarations.ResolvedTypeDeclaration;

import java.util.List;

public class ClassNode extends TypeNode {
    private final String type = "CLASS";

    private int methodsCount = 0;
    private int attributesCount = 10;

    public String getType() {
        return type;
    }

    public int getMethodsCount() {
        return methodsCount;
    }

    public void setMethodsCount(int methodsCount) {
        this.methodsCount = methodsCount;
    }

    public ClassNode(ResolvedClassDeclaration declaration) {
        super(declaration);

        if (declaration.isClass()) {
            this.setMethodsCount(declaration.getDeclaredMethods().size());
            try {
               attributesCount = declaration.getDeclaredFields().size();
            } catch (UnsolvedSymbolException e) {
                System.out.println(e.getName());
            }
        }

    }

}
