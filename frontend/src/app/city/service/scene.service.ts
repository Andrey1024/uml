import { HierarchyRectangularNode } from "d3-hierarchy";

export abstract class SceneService {
    init: (canvas: HTMLDivElement) => void;
    resize: () => void;
    showProject: (hierarchy: HierarchyRectangularNode<any>) => void;
}