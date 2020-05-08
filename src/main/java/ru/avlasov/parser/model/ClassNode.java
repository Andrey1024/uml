package ru.avlasov.parser.model;

public class ClassNode extends InterfaceNode {
    private String superClass;

    public String getSuperClass() {
        return superClass;
    }

    public void setSuperClass(String superClass) {
        this.superClass = superClass;
    }

    public ClassNode() {
        super();
        setType("CLASS");
    }
}
