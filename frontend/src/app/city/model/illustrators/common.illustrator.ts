import { Illustrator, IllustratorHelper } from "./illustrator";
import { ItemNode } from "../tree-item.model";
import { Shape } from "../shapes/shape";
import { Element, TypeElement } from "../presentation/server/element";
import * as THREE from "three";
import { Box } from "../shapes/box";
import { Cylinder } from "../shapes/cylinder";
import { Container } from "../shapes/containers/container";
import { MethodModel } from "../presentation/server/method.model";
import { Brickwork } from "../shapes/containers/brickwork";
import { VersionedElement } from "../versioning/versioned-element.model";
import { VisualizerOptions } from "../../services/visualizer";
import { Pyramid } from "../shapes/containers/pyramid";
import { Color } from "three";


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

    protected makeSelectable(shape: Shape, path: string) {
        this.indicesMap.set(this.pickIndex, path);
        this.namesMap.set(path, shape);
        this.shapesMap.set(this.pickIndex, shape);
        shape.andPickId(this.pickIndex++);
    }

    protected getColor(el: VersionedElement<Element>, options: VisualizerOptions) {
        return options.showChanges
            ? new THREE.Color(el.changes ? el.isFirstEncounter ? "#ffff00" : "#00ff00" : "#646464")
            : new THREE.Color("#ffff00").lerp(new THREE.Color("#0000ff"), el.lifeRatio);
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

    protected createMethodShape(method: VersionedElement<MethodModel>, options: VisualizerOptions): Shape {
        const shape = new Box(8, 8, 8)
            .andColor(this.getColor(method, options))
            .andPadding(1);
        this.makeSelectable(shape, method.data.fullPath);
        return shape;
    }

    protected createAuthorChangeShape(author: string, options: VisualizerOptions): Shape {
        const shape = new Box(8, 4, 8)
            .andColor(new THREE.Color(`hsl(${options.authorColors[author]}, 100%, 50%)`))
            .andPadding(1)
        return shape;
    }

    protected createTypeElementShape(node: ItemNode, options: VisualizerOptions): Shape {
        const { element } = node;
        const props = this.getElementProps(element.data);
        const color = this.getColor(node.element, options);
        let shape: Shape;
        switch (element.data.type) {
            case 'CLASS':
                shape = new Box(props.size, props.height, props.size).andColor(color);
                break;
            case 'INTERFACE':
                const rad = props.size / 2;
                shape = new Cylinder(rad, props.height).andColor(color)
                break;
            default:

                shape = new Box(props.size, props.height, props.size).andColor(color);
        }
        this.makeSelectable(shape, node.item);
        return shape;
    }

    protected createTypeElementWithMethodsShape(node: ItemNode, options: VisualizerOptions): Shape {
        const { element } = node;
        const color = this.getColor(node.element, options);
        switch (element.data.type) {
            case 'CLASS':
            case 'INTERFACE':
                const base = new Box(20, 5, 20).andColor(color);
                this.makeSelectable(base, element.data.fullPath);
                const pyramid = new Pyramid([base]);
                if (node.members.length) {
                    const brickwork = new Brickwork();
                    node.members.forEach(m => brickwork.addChild(this.createMethodShape(m, options)));
                    pyramid.addChild(brickwork);
                }
                return pyramid;
            case "ENUM":
                return this.createTypeElementShape(node, options);
        }
    }

    protected createTypeElementChangesShape(node: ItemNode, options: VisualizerOptions): Shape {
        const { element } = node;
        const base = new Box(20, 1, 20).andColor(this.getColor(node.element, options));
        this.makeSelectable(base, node.item);
        const result = new Pyramid([base]);
        const authors = element.authors ? element.authors.filter(e => !options.ignoredAuthors.includes(e)) : null;
        if (authors !== null && authors.length) {
            const brickwork = new Brickwork();
            for (const author of authors) {
                brickwork.addChild(this.createAuthorChangeShape(author, options));
            }
            result.addChild(brickwork);
        }
        return result;
    }


    createElementShape(node: ItemNode, options: VisualizerOptions): Shape {
        const { element } = node;
        if (!options.showAuthors) {
            switch (options.detailLevel) {
                case "method":
                    return this.createTypeElementWithMethodsShape(node, options);
                case "class":
                    return this.createTypeElementShape(node, options);
            }
        } else {
            return this.createTypeElementChangesShape(node, options);
        }
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