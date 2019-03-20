export interface Node {
    type: "CONTAINER" | "CLASS" | "INTERFACE";
    methodsCount?: number;
}