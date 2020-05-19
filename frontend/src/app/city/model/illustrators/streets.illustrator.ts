import { ItemNode } from "../tree-item.model";
import * as THREE from 'three';
import { CommonIllustrator } from "./common.illustrator";
import { Street } from "../shapes/containers/street";
import { Illustrator } from "./illustrator";
import { Platform } from "../shapes/containers/platform";
import { Row } from "../shapes/containers/row";
import { Plane } from "../shapes/plane";
import { Bridge } from "../shapes/bridge";
import { StreetSide } from "../shapes/containers/street-side";

export class StreetsIllustrator extends CommonIllustrator implements Illustrator<Platform | Street> {

    createPackageShape(node: ItemNode, children: Array<Platform | Street>): Street {
        children.sort((a, b) => b.elevation - a.elevation)
        const color = node === null ? new THREE.Color('#00aac8')
            : new THREE.Color('#00aac8').lerp(new THREE.Color('#0000ff'), node.level / (node.level + node.depth));
        const bridgeLength = 15;
        const width = node === null ? 50 : 50 - 40 * node.level / (node.level + node.depth);
        const leftSide = new StreetSide(), rightSide = new StreetSide(true);
        let leftOffset = 0, rightOffset = 0, elevation = 0, lastSegment = 0;
        const road = new Row();
        for (let i = 0; i < children.length; i++) {
            if (children[i].elevation < elevation) {
                const maxOffset = Math.max(leftOffset, rightOffset);
                road.addChild(new Plane(maxOffset - lastSegment, width, elevation).andColor(color));
                road.addChild(new Bridge(bridgeLength, width, elevation, children[i].elevation).andColor(color));
                lastSegment = leftOffset = rightOffset = maxOffset + bridgeLength;
            }

            if (leftOffset <= rightOffset) {
                leftSide.addChildWithOffset(children[i], leftOffset);
                leftOffset = leftSide.size.x;
            } else {
                rightSide.addChildWithOffset(children[i], rightOffset);
                rightOffset = rightSide.size.x;
            }
            elevation = children[i].elevation;
        }
        road.addChild(new Plane(Math.max(leftOffset, rightOffset) - lastSegment, width, elevation).andColor(color));
        node && this.makeSelectable(road, node.item);
        return new Street(Math.max(...children.map(c => c.elevation)), leftSide, road, rightSide).andPaddingZ(10)

    }

    createRootShape(children: Array<Platform | Street>): Street {
        const street = this.createPackageShape(null, children);
        this.rootShape = street;
        return street;
    }


    createElementShape(node: ItemNode, options): Platform {
        return new Platform(super.createElementShape(node, options), node.lifeRatio * 50).andPaddingZ(5);
    }

}