package ru.avlasov;

import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.*;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevSort;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.AndTreeFilter;
import org.eclipse.jgit.treewalk.filter.PathSuffixFilter;
import org.eclipse.jgit.treewalk.filter.TreeFilter;
import org.springframework.stereotype.Controller;
import ru.avlasov.parser.ClassExtractor;
import ru.avlasov.parser.model.Element;
import ru.avlasov.web.responses.Commit;
import ru.avlasov.web.responses.Project;
import ru.avlasov.web.responses.RepositoryInfo;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.File;
import java.io.IOException;
import java.util.*;

@Controller
public class RepositoryController {
    private final String repositoryDir = "repositories";
    private final Map<String, Repository> repositoryMap = new HashMap<>();


    @PostConstruct
    private void initialize() {
        File reposRoot = new File(repositoryDir);
        if (!reposRoot.exists()) reposRoot.mkdir();
        for (File repoDir : Objects.requireNonNull(reposRoot.listFiles())) {
            try {
                FileRepositoryBuilder repositoryBuilder = new FileRepositoryBuilder();
                Repository repository = repositoryBuilder.setMustExist(true).setGitDir(repoDir).build();
                repositoryMap.put(repoDir.getName(), repository);
            } catch (Exception ignored) {
            }
        }
    }

    @PreDestroy
    private void clean() {
    }

    public void removeRepository(String name) {
        File repoDir = new File(repositoryDir, name.toLowerCase());
        try {
            FileUtils.deleteDirectory(repoDir);
            repositoryMap.remove(name);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<RepositoryInfo> getRepositoryList() {
        List<RepositoryInfo> result = new ArrayList<>();
        for (String repository : repositoryMap.keySet()) {
            String url = repositoryMap.get(repository).getConfig().getString("remote", "origin", "url");
            result.add(new RepositoryInfo(repository, url));
        }
        return result;
    }

    public void cloneRepository(String url, String name) throws GitAPIException {
        if (repositoryMap.containsKey(name)) {
            return;
        }
        Repository repository = Git.cloneRepository()
                .setURI(url).setDirectory(new File(repositoryDir, name))
                .setBare(true).call().getRepository();
        repositoryMap.put(name, repository);
    }

    private RevWalk getRevWalk(String repoName) {
        return new RevWalk(repositoryMap.get(repoName));
    }

    public List<Commit> getCommits(String repoName) throws IOException {
        List<Commit> commits = new ArrayList<>();
        Repository repository = repositoryMap.get(repoName);
        Ref head = repository.exactRef("refs/heads/master");
        try (RevWalk revWalk = getRevWalk(repoName)) {
            revWalk.reset();
            RevCommit revCommit = revWalk.parseCommit(head.getObjectId());
            revWalk.sort(RevSort.COMMIT_TIME_DESC);
            revWalk.markStart(revCommit);
            for (RevCommit commit : revWalk) {
                PersonIdent personIdent = commit.getAuthorIdent();
                commits.add(new Commit(
                        commit.getName(),
                        personIdent.getWhen(),
                        commit.getShortMessage(),
                        personIdent.getEmailAddress(),
                        personIdent.getName()
                ));
            }
            revWalk.dispose();
        }
        return commits;
    }

    public Project parseCommit(String repoName, String commit) throws IOException {
        Repository repository = repositoryMap.get(repoName);
        ObjectId commitObg = repository.resolve(commit);
        Map<String, Map<String, Integer>> fileChangesByAuthors = new HashMap<>();
        ClassExtractor extractor = new ClassExtractor();
        try (RevWalk revWalk = getRevWalk(repoName)) {
            revWalk.reset();
            RevCommit revCommit = revWalk.parseCommit(commitObg);
            RevTree revTree = revCommit.getTree();
            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(revTree);
            treeWalk.setRecursive(true);
            treeWalk.setFilter(PathSuffixFilter.create(".java"));

            while (treeWalk.next()) {
                ObjectLoader loader = repository.open(treeWalk.getObjectId(0));
                String filePath = treeWalk.getPathString();
                extractor.parseFile(filePath, loader.openStream());
                fileChangesByAuthors.put(filePath, new HashMap<>());
            }

            treeWalk.close();
            revWalk.dispose();
        }
        List<Element> elements = extractor.getElements();
        for (Element element : elements) {
            element.setAuthors(fileChangesByAuthors.get(element.getFilePath()));
        }

        return new Project(repoName, commit, elements);
    }

    public Map<String, Map<String, Integer>> countChangesBetweenCommits(String repoName, String commitFrom, String commitTo) throws IOException {
        Map<String, Map<String, Integer>> result = new HashMap<>();
        Repository repository = repositoryMap.get(repoName);
        try (RevWalk revWalk = getRevWalk(repoName)) {
            revWalk.reset();
            revWalk.setTreeFilter(AndTreeFilter.create(PathSuffixFilter.create(".java"), TreeFilter.ANY_DIFF));
            revWalk.markStart(revWalk.parseCommit(repository.resolve(commitTo)));
            revWalk.sort(RevSort.COMMIT_TIME_DESC);

            for (RevCommit revCommit : revWalk) {
                String email = revCommit.getAuthorIdent().getEmailAddress();
                TreeWalk treeWalk = new TreeWalk(repository);
                treeWalk.addTree(revCommit);
                treeWalk.setRecursive(true);
                treeWalk.setFilter(PathSuffixFilter.create(".java"));

                while (treeWalk.next()) {
                    result.getOrDefault(treeWalk.getPathString(), new HashMap<>()).merge(email, 1, Integer::sum);
                }

                if (revCommit.getId().getName().equals(commitFrom)) {
                    break;
                }
            }
            revWalk.dispose();
        }
        return result;
    }
}
