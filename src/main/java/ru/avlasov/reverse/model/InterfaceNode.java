package ru.avlasov.reverse.model;

public class InterfaceNode extends Node {
    private int methodsCount;
    private int attributesCount;

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
