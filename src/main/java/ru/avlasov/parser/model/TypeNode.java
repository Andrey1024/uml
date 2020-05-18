package ru.avlasov.parser.model;

public class TypeNode extends Element {
    private String parentPackage;
    private String sourceRoot;
    private String filePath;

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public void setSourceRoot(String sourceRoot) {
        this.sourceRoot = sourceRoot;
    }

    public String getSourceRoot() {
        return sourceRoot;
    }


    public String getParentPackage() {
        return parentPackage;
    }

    public void setParentPackage(String parentPackage) {
        this.parentPackage = parentPackage;
    }
}
