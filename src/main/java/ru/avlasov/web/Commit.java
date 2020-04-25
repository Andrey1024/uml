package ru.avlasov.web;

import java.util.Date;

public class Commit {
    private final String name;
    private final Date date;
    private final String shortMessage;
    private final Author author;

    public static class Author {
        private final String email;
        private final String name;

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public Author(String email, String name) {
            this.email = email;
            this.name = name;
        }
    };

    ;

    public String getName() {
        return name;
    }

    public Date getDate() {
        return date;
    }

    public Author getAuthor() {
        return author;
    }

    public String getShortMessage() {
        return shortMessage;
    }

    public Commit(String name, Date date, String shortMessage, String email, String author) {
        this.author = new Author(email, author);
        this.date = date;
        this.name = name;
        this.shortMessage = shortMessage;
    }
}
