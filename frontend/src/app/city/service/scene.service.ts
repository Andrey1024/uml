import { HierarchyRectangularNode } from "d3-hierarchy";

export abstract class SceneService {
    init: (canvas: HTMLDivElement) => void;
    resize: () => void;
    addHierarchy: (hierarchy: HierarchyRectangularNode<any>) => void;
}