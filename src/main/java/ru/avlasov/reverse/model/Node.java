package ru.avlasov.reverse.model;

import java.util.Map;

public class Node extends Element {
    private Map<String, Integer> authors;
    public Map<String, Integer> getAuthors() {
        return authors;
    }

    public void setAuthors(Map<String, Integer> authors) {
        this.authors = authors;
    }
}
