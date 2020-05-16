import { Shape } from "../shapes/shape";
import { ItemNode } from "../tree-item.model";
import * as THREE from 'three';
import { CommonIllustrator } from "./common.illustrator";
import { Street } from "../shapes/containers/street";
import { Box } from "../shapes/box";
import { Element } from "../presentation/server/element";

export class StreetsIllustrator extends CommonIllustrator {

    createPackageShape(node: ItemNode, street: Street): Shape {
        const x = street.length;
        const width = 50 - 40 * node.level / (node.level + node.depth);
        const packageShape = new Box(x, 1, width)
            .andColor(new THREE.Color('blue').lerp(new THREE.Color('aqua'), node.level / (node.level + node.depth)));
        street.addRoad(packageShape);
        this.indicesMap.set(this.pickIndex, node.item);
        this.shapesMap.set(this.pickIndex, packageShape);
        this.namesMap.set(node.item, packageShape);
        return street.andPaddingZ(10);
    }

    createRootShape(street: Street): Shape {
        const x = street.length;
        street.addRoad(new Box(x, 1, 50)
            .andColor(new THREE.Color('darkblue')));
        this.rootShape = street;
        return this.rootShape;
    }

    createElementShape(node: Element): Shape {
        return super.createElementShape(node).andPaddingZ(5);
    }

}