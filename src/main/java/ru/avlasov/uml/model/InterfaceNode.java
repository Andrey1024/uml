package ru.avlasov.uml.model;

public class InterfaceNode extends Node {
    private int methodsCount;

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
