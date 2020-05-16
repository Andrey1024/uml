import { ItemNode } from "../model/tree-item.model";
import { IllustratorHelper } from "../model/illustrators/illustrator";

export abstract class Visualizer {
    public abstract get name(): string;
    public abstract visualize(hierarchy: ItemNode[], options): IllustratorHelper;
}