import { ItemNode } from "../tree-item.model";
import { Shape } from "../shapes/shape";
import { CommonIllustrator } from "./common.illustrator";
import { Box } from "../shapes/box";
import { Container } from "../shapes/containers/container";
import * as THREE from 'three';
import { Pyramid } from "../shapes/containers/pyramid";
import { Element } from "../presentation/server/element";

export class DistrictIllustrator extends CommonIllustrator {
    protected readonly packageHeight = 20;

    createPackageShape(node: ItemNode, children: Container): Shape {
        const { x, z } = children.dimensions;
        const packageShape = new Box(x, this.packageHeight, z)
            .andColor(new THREE.Color('aqua').lerp(new THREE.Color('blue'), node.level / (node.level + node.depth)))
            .andPaddingX(10).andPaddingZ(10);
        this.indicesMap.set(this.pickIndex, node.item);
        this.shapesMap.set(this.pickIndex, packageShape);
        this.namesMap.set(node.item, packageShape);
        return new Pyramid([packageShape.andPickId(this.pickIndex++), children]);
    }

    createRootShape(children: Container): Shape {
        const { x, y, z } = children.dimensions;
        this.rootShape = new Pyramid([
            new Box(x + 20, 1, z + 20).andColor(new THREE.Color('aqua')), children
        ]);

        return this.rootShape;
    }

    createElementShape(node: Element): Shape {
        return super.createElementShape(node).andPaddingX(5).andPaddingZ(5);
    }
}