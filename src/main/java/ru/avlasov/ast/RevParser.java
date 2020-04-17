package ru.avlasov.ast;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;

import java.io.InputStream;

public class RevParser {
    private final ParserConfiguration parserConfiguration;

    public RevParser(ParserConfiguration parserConfiguration) {
        this.parserConfiguration = parserConfiguration;
    }

    public ParseResult<CompilationUnit> parse(InputStream inputStream) {
        return new JavaParser(parserConfiguration).parse(inputStream);
    }
}
