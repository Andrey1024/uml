package ru.avlasov.parser.model;

public class EnumNode extends Element {
    private int numberOfConstants;

    public int getNumberOfConstants() {
        return numberOfConstants;
    }

    public void setNumberOfConstants(int numberOfConstants) {
        this.numberOfConstants = numberOfConstants;
    }

    public EnumNode() {
        super();
        setType("ENUM");
    }
}
