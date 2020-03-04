export interface NodeVersioned<T> {
    fullPath: string
    data: {
        [version: string]: T;
    }
}
