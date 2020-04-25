export interface Author {
    name: string;
    email: string;
}

export interface Commit {
    name: string;
    author: Author;
    date: Date;
    shortMessage: string;
}