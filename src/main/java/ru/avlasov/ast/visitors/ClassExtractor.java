package ru.avlasov.ast.visitors;

import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ClassExtractor extends VoidVisitorAdapter<Map<String, List<ResolvedReferenceTypeDeclaration>>> {

    @Override
    public void visit(ClassOrInterfaceDeclaration expr, Map<String, List<ResolvedReferenceTypeDeclaration>> types) {
        super.visit(expr, types);
        ResolvedReferenceTypeDeclaration declaration = expr.resolve();


        if (!types.containsKey(declaration.getPackageName())) {
            types.put(declaration.getPackageName(), new ArrayList<>());
        }
        types.get(declaration.getPackageName()).add(declaration);
    }
}
