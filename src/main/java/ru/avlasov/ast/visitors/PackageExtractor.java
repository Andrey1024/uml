package ru.avlasov.ast.visitors;

import com.github.javaparser.ast.PackageDeclaration;
import com.github.javaparser.ast.expr.Name;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import ru.avlasov.ast.nodes.PackageTree;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class PackageExtractor extends VoidVisitorAdapter<Map<String, PackageTree>> {

    @Override
    public void visit(PackageDeclaration declaration, Map<String, PackageTree> declarations) {
        super.visit(declaration, declarations);
        if (!declarations.containsKey(declaration.getNameAsString())) {
            String qualifier = declaration.getName().getQualifier().map(Name::asString)
                    .filter(declarations::containsKey).orElse(null);
            PackageTree parent = null;
            if (qualifier != null && declarations.containsKey(qualifier)) {
                parent = declarations.get(qualifier);
            }
            PackageTree tree = new PackageTree(
                    declaration.getName(), parent, declarations.values().stream()
                    .filter(packageTree -> packageTree.getQualifier().equals(declaration.getNameAsString()))
                    .collect(Collectors.toList()));
            declarations.put(declaration.getNameAsString(), tree);
            tree.getChildren().forEach(child -> child.setParent(tree));

            if (parent != null) {
                parent.getChildren().add(tree);
            }
        }

    }
}
