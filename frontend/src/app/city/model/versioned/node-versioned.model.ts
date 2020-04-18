export interface NodeVersioned<T> {
    fullPath: string
    name: string;
    data: {
        [version: string]: T;
    }
}
