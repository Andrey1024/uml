export interface Node {
    type: string;
    name: string;
    parentPackage: string;
    fullPath: string
    lifeSpan: number;
}
