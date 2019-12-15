export interface Hierarchy {
    [packageOrTypeName: string]: Element | Hierarchy;
}
