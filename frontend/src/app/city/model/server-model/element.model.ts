export interface ElementModel {
    type: string;
    name: string;
    fullPath: string;
    filePath: string;
    parentPackage: string;
    lifeSpan: number;
    lifeRatio: number;
    numberOfLines: number;
    authors: { [email: string]: number };
    sourceRoot: string;
}