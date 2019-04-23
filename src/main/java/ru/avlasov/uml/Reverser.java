package ru.avlasov.uml;

import org.eclipse.uml2.uml.Class;
import org.eclipse.uml2.uml.*;
import org.eclipse.uml2.uml.Package;
import org.springframework.stereotype.Service;
import ru.avlasov.uml.model.*;
import ru.avlasov.uml.model.Node;
import uml.java.reverser.asm.AsmBytecodeReverser;

import javax.annotation.PostConstruct;
import java.io.File;
import java.util.Arrays;
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

    public ContainerNode reverse(String path) {
        String rootPath = new File(".").getAbsolutePath().replace(".", "");
        Model model = UMLFactory.eINSTANCE.createModel();
        reverser.reverseJarFileCollection(Arrays.asList(rootPath.concat(path)), model, trace);
        ContainerNode pack = new ContainerNode();
        addNestedNodes(model, pack, null);
        return pack;
    }

    private void addNestedNodes(Package ownerPackage, ContainerNode entity, String path) {
        entity.setName(ownerPackage.getName());
        entity.setFullPath(path == null ? ownerPackage.getName() : path + "." + ownerPackage.getName());
        addClassifiers(ownerPackage, entity, entity.getFullPath());
        for (Package ownedPackage : ownerPackage.getNestedPackages()) {
            ContainerNode node = new ContainerNode();
            node.setName(ownedPackage.getName());
            addNestedNodes(ownedPackage, node, entity.getFullPath());
            entity.addChild(node);
        }
    }

    private void addClassifiers(Package ownerPackage, ContainerNode ownerNode, String path) {
        ownerPackage.getOwnedTypes().stream()
                .filter(t -> t instanceof Classifier)
                .forEach(t -> {
                    Node node = null;
                    if (t instanceof Class) {
                        node = this.createClassNode((Class) t);
                    } else if (t instanceof Interface) {
                        node = this.createInterfaceNode((Interface) t);
                    } else if (t instanceof Enumeration) {
                        node = new EnumNode();
                    }
                    if (node != null) {
                        node.setName(t.getName());
                        node.setFullPath(ownerNode.getFullPath());
                        node.setFullPath(path + "." + t.getName());
                        ownerNode.addChild(node);
                    }
                });
    }

    private ClassNode createClassNode(Class item) {
        ClassNode node = new ClassNode();

        node.setMethodsCount(item.getOwnedOperations().size());

        return node;
    }

    private InterfaceNode createInterfaceNode(Interface item) {
        InterfaceNode node = new InterfaceNode();

        node.setMethodsCount(item.getOwnedOperations().size());

        return node;
    }

}
