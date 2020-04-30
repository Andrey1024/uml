package ru.avlasov.web.responses;

public class CreateRequest {
    private String url;
    private String name;

    public void setUrl(String url) {
        this.url = url;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public String getName() {
        return name;
    }

    public CreateRequest() {

    }

    public CreateRequest(String url, String name) {
        this.url = url;
        this.name = name;
    }
}
