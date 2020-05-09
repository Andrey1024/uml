package ru.avlasov.web.responses;

import ru.avlasov.parser.model.Element;

import java.util.List;

public class Project {
    private String repositoryName;
    private String commit;
    private List<Element> data;

    public String getRepositoryName() {
        return repositoryName;
    }

    public void setRepositoryName(String repositoryName) {
        this.repositoryName = repositoryName;
    }

    public String getCommit() {
        return commit;
    }

    public void setCommit(String commit) {
        this.commit = commit;
    }

    public List<Element> getData() {
        return data;
    }

    public void setData(List<Element> data) {
        this.data = data;
    }

    public Project(String repositoryName, String commit, List<Element> data) {
        this.data = data;
        this.commit = commit;
        this.repositoryName = repositoryName;
    }
}
