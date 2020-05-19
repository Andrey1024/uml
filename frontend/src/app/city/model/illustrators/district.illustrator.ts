import { ItemNode } from "../tree-item.model";
import { Shape } from "../shapes/shape";
import { CommonIllustrator } from "./common.illustrator";
import { Box } from "../shapes/box";
import { Container } from "../shapes/containers/container";
import * as THREE from 'three';
import { Pyramid } from "../shapes/containers/pyramid";
import { Element } from "../presentation/server/element";
import { VersionedElement } from "../versioning/versioned-element.model";
import { Illustrator } from "./illustrator";
import { Grid } from "../shapes/containers/grid";

export class DistrictIllustrator extends CommonIllustrator implements Illustrator<Shape> {
    protected readonly packageHeight = 20;

    createPackageShape(node: ItemNode, children: Shape[]): Shape {
        const group = new Grid(children);
        const { x, z } = group.dimensions;
        const packageShape = new Box(x, this.packageHeight, z)
            .andColor(new THREE.Color('#00aac8').lerp(new THREE.Color('#0000ff'), node.level / (node.level + node.depth)))
            .andPaddingX(10).andPaddingZ(10);
        this.makeSelectable(packageShape, node.item);
        return new Pyramid([packageShape, group]);
    }

    createRootShape(children: Shape[]): Shape {
        const group = new Grid(children);
        const { x, y, z } = group.dimensions;
        this.rootShape = new Pyramid([
            new Box(x + 20, 1, z + 20).andColor(new THREE.Color('#00aac8')), group
        ]).andTranslate(0, group.dimensions.y / 2, 0);

        return this.rootShape;
    }

    createElementShape(node: ItemNode, options): Shape {
        return super.createElementShape(node, options).andPaddingX(5).andPaddingZ(5);
    }
}