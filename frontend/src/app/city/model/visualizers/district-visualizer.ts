import { AbstractVisualizer } from "./abstract-visualizer";
import { Shape } from "../shapes/shape";
import { Element } from "../server-model/element";
import { Grid } from "../grid.model";
import * as THREE from "three";
import { Box } from "../shapes/box";
import { Cylinder } from "../shapes/cylinder";
import { ItemNode } from "../tree-item.model";
import { Group } from "../shapes/group";

export class DistrictVisualizer extends AbstractVisualizer {

    private getElementProps(el: Element): { size: number, height: number } {
        switch (el.type) {
            case "CLASS":
            case "INTERFACE":
                return {
                    size: AbstractVisualizer.closeValue(el.attributesCount, 10, 20, 30, 40, 50) * 2,
                    height: AbstractVisualizer.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 3
                };
            default:
                return { size: 10, height: 40 }
        }
    }

    createElementShape(element: Element, options): Shape {
        const props = this.getElementProps(element);
        const color = new THREE.Color("yellow").lerp(new THREE.Color("#BF3030"), element.lifeRatio);
        let shape: Shape;
        switch (element.type) {
            default:
            case 'CLASS':
                shape = new Box(props.size, props.height, props.size);
                break;
            case 'INTERFACE':
                const rad = props.size / 2;
                shape = new Cylinder(rad, props.height);
        }
        shape.andTranslate(0, props.height / 2, 0).andColor(color);
        return shape;
    }

    createPackageShape(node:ItemNode, children:Group): Shape {
        children.andTranslate(0, 15, 0);
        const dimensions = children.getDimensions();
        return new Box(dimensions.x , 30,dimensions.z).andTranslate(0,15,0)
            .andColor( new THREE.Color("#3059bf"));
    }

    createRootShape(children: Shape[]): Shape {
        return undefined;
    }

    createNestedGroup(children: Shape[]): Group {
        return new Grid(children);
    }
}