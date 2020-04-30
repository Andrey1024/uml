package ru.avlasov.web.responses;

public class RepositoryInfo {
    private final String name;
    private final String url;

    public String getName() {
        return name;
    }

    public String getUrl() {
        return url;
    }

    public RepositoryInfo(String name, String url) {
        this.name = name;
        this.url = url;
    }
}
