package ru.avlasov.parser.model;

import java.util.ArrayList;
import java.util.List;

public class InterfaceNode extends TypeNode {
    private int methodsCount;
    private int attributesCount;
    private final List<String> implementedTypes = new ArrayList<>();
    private final List<String> methods = new ArrayList<>();

    public List<String> getMethods() {
        return methods;
    }

    public List<String> getImplementedTypes() {
        return implementedTypes;
    }

    public int getAttributesCount() {
        return attributesCount;
    }

    public void setAttributesCount(int attributesCount) {
        this.attributesCount = attributesCount;
    }

    public int getMethodsCount() {
        return methodsCount;
    }

    public void setMethodsCount(int methodsCount) {
        this.methodsCount = methodsCount;
    }

    public InterfaceNode() {
        super();
        setType("INTERFACE");
    }
}
