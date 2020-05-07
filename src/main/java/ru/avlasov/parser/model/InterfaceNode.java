package ru.avlasov.parser.model;

import java.util.List;

public class InterfaceNode extends Element {
    private int methodsCount;
    private int attributesCount;
    private List<String> extendedTypes;
    private List<String> implementedTypes;

    public List<String> getImplementedTypes() {
        return implementedTypes;
    }

    public void setImplementedTypes(List<String> implementedTypes) {
        this.implementedTypes = implementedTypes;
    }

    public List<String> getExtendedTypes() {
        return extendedTypes;
    }

    public void setExtendedTypes(List<String> extendedTypes) {
        this.extendedTypes = extendedTypes;
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
