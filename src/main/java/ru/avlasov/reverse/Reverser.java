package ru.avlasov.reverse;

import org.eclipse.uml2.uml.*;
import org.eclipse.uml2.uml.Class;
import org.eclipse.uml2.uml.Package;
import org.springframework.stereotype.Service;
import ru.avlasov.reverse.model.*;
import ru.avlasov.reverse.model.Element;
import uml.java.reverser.asm.AsmBytecodeReverser;

import javax.annotation.PostConstruct;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

@Service
public class Reverser {

    private static Logger log = Logger.getLogger(Reverser.class.toString());
    private AsmBytecodeReverser reverser;
    private LogProgressTracing trace;

    @PostConstruct
    private void initialize() {
        reverser = new AsmBytecodeReverser();
        trace = new LogProgressTracing(log);
    }

    public List<Element> reverse(String path) {
        String rootPath = new File(".").getAbsolutePath().replace(".", "");
        Model model = UMLFactory.eINSTANCE.createModel();
        reverser.reverseJarFileCollection(Collections.singletonList(rootPath.concat(path)), model, trace);

        return reverse(model);
    }

    public List<Element> reverse(Model model) {
        List<Element> elements = new ArrayList<>();
        addNestedNodes(elements, model, new ContainerNode(), null);
        return elements;
    }

    private void addNestedNodes(List<Element> elements, Package ownerPackage, ContainerNode entity, String path) {
        entity.setName(ownerPackage.getName());
        entity.setFullPath(path == null ? ownerPackage.getName() : path + "." + ownerPackage.getName());
        for (Package ownedPackage : ownerPackage.getNestedPackages()) {
            ContainerNode node = new ContainerNode();
            node.setParentPackage(entity.getFullPath());
            node.setName(ownedPackage.getName());
            addNestedNodes(elements, ownedPackage, node, entity.getFullPath());
            entity.addChild(node.getFullPath());
//            elements.add(node);
        }
        addClassifiers(elements, ownerPackage, entity);
    }

    private void addClassifiers(List<Element> elements, Package ownerPackage, ContainerNode ownerNode) {
        ownerPackage.getOwnedTypes().stream()
                .filter(t -> t instanceof Classifier)
                .forEach(t -> {
                    Element node = null;
                    if (t instanceof Class) {
                        node = this.createClassNode((Class) t);
                    } else if (t instanceof Interface) {
                        node = this.createInterfaceNode((Interface) t);
                    } else if (t instanceof Enumeration) {
                        node = new EnumNode();
                    }
                    if (node != null) {
                        node.setName(t.getName());
                        node.setFullPath(ownerNode.getFullPath() + "." + t.getName());
                        node.setParentPackage(ownerNode.getFullPath());
                        ownerNode.addChild(node.getFullPath());
                        elements.add(node);
                    }
                });
    }

    private ClassNode createClassNode(Class item) {
        ClassNode node = new ClassNode();

        node.setMethodsCount(item.getOwnedOperations().size());
        node.setAttributesCount(item.getOwnedAttributes().size());

        return node;
    }

    private InterfaceNode createInterfaceNode(Interface item) {
        InterfaceNode node = new InterfaceNode();

        node.setMethodsCount(item.getOwnedOperations().size());
        node.setAttributesCount(item.getOwnedAttributes().size());

        return node;
    }

}
