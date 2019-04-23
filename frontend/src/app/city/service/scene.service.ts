import {Element} from "../model/element.model";
import {HierarchyNode} from "d3-hierarchy";

export abstract class SceneService {
    init: (canvas: HTMLDivElement) => void;
    resize: () => void;
    show: (hierarchy: Element) => void;
    showProject: (hierarchy: HierarchyNode<Element>) => void;
}