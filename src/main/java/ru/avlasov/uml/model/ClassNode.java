package ru.avlasov.uml.model;

public class ClassNode extends Node {
    private int methodsCount;

    public int getMethodsCount() {
        return methodsCount;
    }

    public void setMethodsCount(int methodsCount) {
        this.methodsCount = methodsCount;
    }

    public ClassNode() {
        super();
        setType("CLASS");
    }
}
