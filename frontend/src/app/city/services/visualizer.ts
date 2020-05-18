import { ItemNode } from "../model/tree-item.model";
import { IllustratorHelper } from "../model/illustrators/illustrator";
import { ById } from "../model/by-id";

export interface VisualizerOptions {
    detailLevel: 'class' | 'method';
    showChanges: boolean;
    showAuthors: boolean;
    authorColors?: ById<string>;
    ignoredAuthors?: string[];
}

export abstract class Visualizer {
    public abstract get name(): string;
    public abstract visualize(hierarchy: ItemNode[], options: VisualizerOptions): IllustratorHelper;
}