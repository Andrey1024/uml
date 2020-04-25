package ru.avlasov;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.*;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevSort;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathFilter;
import org.eclipse.jgit.treewalk.filter.PathSuffixFilter;
import org.springframework.stereotype.Controller;
import ru.avlasov.ast.UmlGenerator;
import ru.avlasov.reverse.Reverser;
import ru.avlasov.reverse.model.Element;
import ru.avlasov.reverse.model.Node;
import ru.avlasov.reverse.model.Project;
import ru.avlasov.web.Commit;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.File;
import java.io.IOException;
import java.util.*;

@Controller
public class ProjectParser {
    private final String repositoryDir = "repositories";
    private final Map<String, Repository> repositoryMap = new HashMap<>();

    private final Reverser reverser;
    private final ParserConfiguration configuration;

    public ProjectParser(Reverser reverser) {
        this.reverser = reverser;
        configuration = new ParserConfiguration();
        configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.CURRENT);
        configuration.setSymbolResolver(new JavaSymbolSolver(new CombinedTypeSolver(new ReflectionTypeSolver(false))));
    }

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

    public boolean hasRepository(String name) {
        return repositoryMap.containsKey(name);
    }

    @PreDestroy
    private void clean() {
    }

    public List<String> getRepositoryList() {
        return new ArrayList<>(repositoryMap.keySet());
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
        Map<String, UmlGenerator> sourceRoots = new HashMap<>();

        Repository repository = repositoryMap.get(repoName);
        ObjectId commitObg = repository.resolve(commit);
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
                ParseResult<CompilationUnit> parseResult = new JavaParser(configuration).parse(loader.openStream());
                if (parseResult.getResult().isPresent()) {
                    String sourceRoot = getSourceRoot(filePath, parseResult.getResult().get());
                    if (!sourceRoot.isEmpty()) {
                        if (!sourceRoots.containsKey(sourceRoot)) sourceRoots.put(sourceRoot, new UmlGenerator());
                        sourceRoots.get(sourceRoot).parseToModel(parseResult.getResult().get());
                    }
                }
            }
            treeWalk.close();
            revWalk.dispose();
        }


        List<Element> result = new ArrayList<>();
        for (String sourceRoot : sourceRoots.keySet()) {
            List<Element> elements = reverser.reverse(sourceRoots.get(sourceRoot).getModel());
            for (Element el : elements) {
                if (!el.getType().equals("CONTAINER")) {
                    ((Node) el).setAuthors(countFileChanges(repoName, commit, getPathFromName(sourceRoot, el.getFullPath())));
                    el.setSourceRoot(sourceRoot);
                }
                result.add(el);
            }
        }

        return new Project(repoName, commit, result);
    }


    private Map<String, Integer> countFileChanges(String repoName, String commitName, String path) throws IOException {
        Repository repository = repositoryMap.get(repoName);
        Map<String, Integer> result = new HashMap<>();
        try (RevWalk revWalk = getRevWalk(repoName)) {
            revWalk.reset();
            revWalk.setTreeFilter(PathFilter.create(path));
            revWalk.markStart(revWalk.parseCommit(repository.resolve(commitName)));
            revWalk.sort(RevSort.COMMIT_TIME_DESC);

            for (RevCommit revCommit : revWalk) {
                PersonIdent personIdent = revCommit.getAuthorIdent();
                if (personIdent != null) {
                    String email = revCommit.getAuthorIdent().getEmailAddress();
                    if (!result.containsKey(email)) {
                        result.put(email, 0);
                    }
                    result.put(email, result.get(email) + 1);
                }
            }
            revWalk.dispose();
        }
        return result;
    }


    private String getSourceRoot(String path, CompilationUnit cu) {
        if (cu.getPackageDeclaration().isPresent()) {
            return getSourceRoot(path, cu.getPackageDeclaration().get().getNameAsString());
        } else {
            return "";
        }
    }

    private String getSourceRoot(String path, String packageName) {
        String packagePath = packageName.replace('.', '/');
        if (path.contains(packagePath)) {
            return path.substring(0, path.lastIndexOf(packagePath));
        } else {
            return "";
        }
    }

    private String getPathFromName(String sourceRoot, String className) {
        return sourceRoot.concat(className.replace('.', '/')).concat(".java");
    }
}
