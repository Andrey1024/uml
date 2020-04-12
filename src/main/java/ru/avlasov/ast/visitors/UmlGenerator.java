package ru.avlasov.ast.visitors;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.PackageDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import com.github.javaparser.resolution.declarations.ResolvedReferenceTypeDeclaration;
import org.eclipse.uml2.uml.Model;
import org.eclipse.uml2.uml.Package;
import org.eclipse.uml2.uml.UMLFactory;

import java.util.List;

public class UmlGenerator {
    private List<CompilationUnit> compilationUnits;
    private Model model;

    public UmlGenerator(List<CompilationUnit> compilationUnits, Model model) {
        this.compilationUnits = compilationUnits;
        this.model = model;
        this.compilationUnits.forEach(this::getClasses);
    }

    public Model getModel() {
        return model;
    }

    private void getClasses(CompilationUnit cu) {

        new VoidVisitorAdapter<Object>() {
            @Override
            public void visit(ClassOrInterfaceDeclaration n, Object arg) {
                ResolvedReferenceTypeDeclaration type = n.resolve();
                String packageName = type.getPackageName();
                Package thePackage = model;
                String[] names = packageName.split("\\.");
                for (int i = 0; i < names.length; ++i) {
                    Package nestedPackage = thePackage.getNestedPackage(names[i]);
                    if (nestedPackage == null) {
                        nestedPackage = thePackage.createNestedPackage(names[i]);
                    }
                    thePackage = nestedPackage;
                }

                if (type.isInterface()) {
                    thePackage.createOwnedInterface(type.getName());
                } else if (type.isClass()) {
                    thePackage.createOwnedClass(type.getClassName(), false);
                }
                super.visit(n, arg);
            }
        }.visit(cu, null);
    }
}
