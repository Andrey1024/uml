package ru.avlasov;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import ru.avlasov.ast.ProjectParser;
import ru.avlasov.ast.nodes.Project;

import java.io.File;
import java.io.IOException;

@SpringBootApplication
public class UmlApplication {


    public static void main(String[] args) throws IOException {
        SpringApplication.run(UmlApplication.class, args);
    }
}