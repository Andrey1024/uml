package ru.avlasov.parser.model;

import java.util.ArrayList;
import java.util.List;

public class InterfaceNode extends Element {
    private int methodsCount;
    private int attributesCount;
    private final List<String> implementedTypes = new ArrayList<>();

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
