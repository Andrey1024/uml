package ru.avlasov.parser.model;

import java.util.Map;

public class Element {
    private String type;
    private String filePath;
    private String name;
    private String fullPath;
    private String parentPackage;
    private String sourceRoot;
    private int numberOfLines;
    private Map<String, Integer> authors;

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public int getNumberOfLines() {
        return numberOfLines;
    }

    public void setNumberOfLines(int numberOfLines) {
        this.numberOfLines = numberOfLines;
    }

    public Map<String, Integer> getAuthors() {
        return authors;
    }

    public void setAuthors(Map<String, Integer> authors) {
        this.authors = authors;
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

    public String getFullPath() {
        return fullPath;
    }

    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }

    public String getType() {
        return type;
    }

    protected void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Element() {

    }
}
