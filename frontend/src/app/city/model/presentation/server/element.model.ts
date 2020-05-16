export interface ElementModel {
    type: string;
    name: string;
    fullPath: string;
    filePath: string;
    parentPackage: string;
    numberOfLines: number;
    sourceRoot: string;
}