package ru.avlasov.parser.model;

public class Method {
    private String name;
    private int numberOfLines;
    private String returnType;
    private String[] parameterTypes;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getNumberOfLines() {
        return numberOfLines;
    }

    public void setNumberOfLines(int numberOfLines) {
        this.numberOfLines = numberOfLines;
    }
}
