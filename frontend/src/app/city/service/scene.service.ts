import { HierarchyRectangularNode } from "d3-hierarchy";
import {Element} from "../model/element.model";

export abstract class SceneService {
    init: (canvas: HTMLDivElement) => void;
    resize: () => void;
    showProject: (hierarchy: HierarchyRectangularNode<any>) => void;
    show: (hierarchy: Element) => void;
}