import { Illustrator, IllustratorHelper } from "./illustrator";
import { ItemNode } from "../tree-item.model";
import { Shape } from "../shapes/shape";
import { Element } from "../presentation/server/element";
import * as THREE from "three";
import { Box } from "../shapes/box";
import { Cylinder } from "../shapes/cylinder";
import { Container } from "../shapes/containers/container";
import { MethodModel } from "../presentation/server/method.model";
import { Brickwork } from "../shapes/containers/brickwork";


export abstract class CommonIllustrator implements Illustrator, IllustratorHelper {
    protected pickIndex = 1;
    protected indicesMap = new Map<number, string>();
    protected namesMap = new Map<string, Shape>();
    protected shapesMap = new Map<number, Shape>();
    protected rootShape: Shape;

    protected static closeValue(value: number, ...steps: number[]): number {
        let i = 0;
        while (value > steps[i] && steps.length > i + 1) {
            i++;
        }

        return steps[i];
    }

    protected getElementProps(el: Element): { size: number, height: number } {
        switch (el.type) {
            case "CLASS":
            case "INTERFACE":
                return {
                    size: CommonIllustrator.closeValue(el.attributesCount, 10, 20, 30, 40, 50) * 2,
                    height: CommonIllustrator.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 3
                };
            default:
                return { size: 10, height: 40 }
        }
    }

    createMethodMesh(method: MethodModel) {
        return new Box(8, 8, 8).andColor(new THREE.Color('yellow')).andPadding(1);
    }


    createElementShape(node: Element): Shape {
        const props = this.getElementProps(node);
        const color = new THREE.Color("yellow").lerp(new THREE.Color("#BF3030"), node.lifeRatio);
        let shape: Shape;
        switch (node.type) {
            case 'CLASS':
                if (node.methods.length) {
                    const brickwork = new Brickwork();
                    node.methods.forEach(m => brickwork.addChild(this.createMethodMesh(m)));
                    shape = brickwork;
                } else {
                    shape = new Box(props.size, props.height, props.size).andColor(color);
                }
                break;
            case 'INTERFACE':
                const rad = props.size / 2;
                shape = new Cylinder(rad, props.height).andColor(color)
                break;
            default:

                shape = new Box(props.size, props.height, props.size).andColor(color);
        }
        this.indicesMap.set(this.pickIndex, node.fullPath);
        this.namesMap.set(node.fullPath, shape);
        this.shapesMap.set(this.pickIndex, shape);
        return shape.andPickId(this.pickIndex++);
    }

    abstract createPackageShape(node: ItemNode, children: Container);

    abstract createRootShape(children: Container): Shape;

    getTreeMesh(): THREE.Mesh {
        return new THREE.Mesh(this.rootShape.finalize(), new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
            vertexColors: true,
        }));
    }

    getPickingMesh(): THREE.Mesh {
        return new THREE.Mesh(this.rootShape.getPickGeometry(), new THREE.MeshBasicMaterial({
            vertexColors: true,
        }));
    }

    createHighLightMesh(name: string, color: string): THREE.Mesh {
        const originalShape = this.namesMap.get(name);
        return new THREE.Mesh(originalShape.getHighLightGeometry(), new THREE.MeshPhongMaterial({
            color: new THREE.Color(color), shininess: 0.1
        }))

    }

    getNameByIndex(index: number): string {
        return this.indicesMap.get(index);
    }
}