package ru.avlasov.umltest;

import org.eclipse.uml2.uml.Model;
import org.eclipse.uml2.uml.NamedElement;
import org.eclipse.uml2.uml.Package;
import org.eclipse.uml2.uml.UMLFactory;

class CppParserRunner {
    private String projectPath = ".";

    void main(String[] args) {
        testLoadSaveModel();
    }

    private void testLoadSaveModel() {
        Model model = UMLFactory.eINSTANCE.createModel();
        model.setName("Sample");
        model.createNestedPackage("NestedPackage");

        String modelName = model.getName();

        ResourceUtil.saveModel(model, projectPath, modelName);
        System.out.format("UML model saved to file: %s/%s.uml %n", projectPath, modelName);

        Package savedModel = ResourceUtil.loadModel(projectPath, modelName, "uml");
        System.out.format("UML model loaded from file: %s/%s.uml %n", projectPath, modelName);

        dumpPackage(savedModel);
    }

    private void dumpPackage(Package p) {
        System.out.format("package: %s%n", p.getName());

        for (NamedElement ne : p.getOwnedMembers()) {
            String kindName = ne.getClass().getSimpleName();
            System.out.format("   %s: %s%n", kindName, ne.getName());
        }
    }
}