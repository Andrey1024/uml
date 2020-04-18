package ru.avlasov.ast;

import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectLoader;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathSuffixFilter;
import org.eclipse.uml2.uml.Model;
import org.eclipse.uml2.uml.UMLFactory;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

public class ProjectParser {
    private Git git = null;
    private String url;


    public ProjectParser(String repositoryUrl) {
        this.url = repositoryUrl;
    }

    public List<CommitInfo> listCommits() throws IOException, GitAPIException {
        DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        List<CommitInfo> commitList = new ArrayList<>();
        if (git == null) {
            File repositoryDir = File.createTempFile("remote", "");
            repositoryDir.delete();
            git = Git.cloneRepository().setURI(url).setDirectory(repositoryDir).call();
        }
        int step;
        Ref head = git.getRepository().exactRef("refs/heads/master");
        try (RevWalk walk = new RevWalk(git.getRepository())) {
            int count = 0;
            RevCommit commit = walk.parseCommit(head.getObjectId());
            walk.markStart(commit);
            for (RevCommit rev : walk) {
                count++;
            }
            step = count / 10;
            walk.dispose();
        }

        try (RevWalk walk = new RevWalk(git.getRepository())) {
            RevCommit commit = walk.parseCommit(head.getObjectId());
            walk.markStart(commit);
            int count = 0;
            for (RevCommit rev: walk) {
                if (count % step == 0) {
                    commitList.add(new CommitInfo(rev.getName(), sdf.format(rev.getAuthorIdent().getWhen())));
                }
                count++;
            }
            walk.dispose();
        }
        Collections.reverse(commitList);
        return commitList;
    }

    public Model parseCommit(String commit) throws IOException {
        Model result = UMLFactory.eINSTANCE.createModel();

        ObjectId commitObg = git.getRepository().resolve(commit);
        try (RevWalk revWalk = new RevWalk(git.getRepository())) {
            RevCommit revCommit = revWalk.parseCommit(commitObg);
            RevTree tree = revCommit.getTree();
            TreeWalk treeWalk = new TreeWalk(git.getRepository());
            treeWalk.addTree(tree);
            treeWalk.setRecursive(true);
            treeWalk.setFilter(PathSuffixFilter.create(".java"));

            ParserConfiguration configuration = new ParserConfiguration();
            configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.CURRENT);
            configuration.setSymbolResolver(new JavaSymbolSolver(new CombinedTypeSolver(new ReflectionTypeSolver(false))));
            RevParser revParser = new RevParser(configuration);
            List<CompilationUnit> results = new ArrayList<>();
            while (treeWalk.next()) {
                ObjectLoader loader = git.getRepository().open(treeWalk.getObjectId(0));
                results.add(revParser.parse(loader.openStream()).getResult().get());
            }
            UmlVisitor uml = new UmlVisitor(result);
            results.forEach(uml::ParseToModel);

            revWalk.dispose();
        }


        return result;
    }

    public void clean() throws IOException {
        if (git != null) {
            git.close();
            FileUtils.deleteDirectory(git.getRepository().getWorkTree());
        }
    }

    public static class CommitInfo {
        private final String commit;
        private final String date;

        public String getCommit() {
            return commit;
        }

        public String getDate() {
            return date;
        }

        CommitInfo(String commit, String date) {
            this.commit = commit;
            this.date = date;
        }
    }
}
