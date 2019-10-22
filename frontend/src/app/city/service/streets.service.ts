import {Injectable} from "@angular/core";
import {LayoutService} from "./layout.service";
import {Element} from "../model/element.model";
import * as THREE from 'three';
import {objectKeys} from "codelyzer/util/objectKeys";

interface FlatStreet {
    width: number;
    height: number;
    data: Element;
    children?: FlatStreet[];
    left?: number;
    right?: number
}


@Injectable()
export class StreetsService implements LayoutService {
    readonly padding = 5;

    place(hierarchy: Element): THREE.Object3D[] {
        const flat = this.flat(hierarchy);
        console.log(flat);
        return this.computePositions(flat, {x: 0, y: 0}, 0);
    }

    private static closeValue(value: number, ...steps: number[]): number {
        let i = 0;
        if (value >= steps[steps.length - 1]) {
            return steps[steps.length - 1];
        }
        while (value > steps[i]) {
            i++;
        }

        return steps[i];
    }

    private flat(el: Element): FlatStreet {
        switch (el.type) {
            case "CLASS":
            case "INTERFACE":
                const size = StreetsService.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 2;
                return {
                    width: size, height: size, data: el
                };
            case "ENUM":
                return {
                    width: 15, height: 15, data: el
                };
            case "CONTAINER":
                const sorted = el.children.map(e => this.flat(e as Element));
                const odd = sorted.filter((_, i) => i % 2 === 1);
                const even = sorted.filter((_, i) => i % 2 === 0);
                const height = Math.max(
                    odd.reduce((sum, val) => sum + val.width + this.padding, 0),
                    even.reduce((sum, val) => sum + val.width + this.padding, 0),
                    0
                );
                const left = Math.max(...even.map(c => c.height), 0);
                const right = Math.max(...odd.map(c => c.height), 0);
                return {
                    left, right,
                    width: left + 20 + right,
                    height, children: sorted, data: el
                }

        }
    }

    private computePositions(el: FlatStreet, position: { x: number, y: number }, direction: number): THREE.Object3D[] {
        switch (el.data.type) {
            case "CLASS":
            case "ENUM":
            case "INTERFACE":
                return [this.createNodeMesh(el.data, position.x, position.y, el.width, el.height, direction)];
            case "CONTAINER":
                const objects = [];
                const odd = el.children.filter((_, i) => i % 2 === 1);
                const even = el.children.filter((_, i) => i % 2 === 0);
                objects.push(this.createNodeMesh(
                    el.data,
                    position.x - el.right * Math.sin(direction),
                    position.y + el.right * Math.cos(direction),
                    el.width - el.left - el.right, el.height, direction));
                for (let i = 0, offset = 0; i < even.length; i++) {
                    offset += even[i].width + this.padding;
                    objects.push(...this.computePositions(even[i], {
                        x: position.x - (el.width - el.left) * Math.sin(direction) + offset * Math.cos(direction),
                        y: position.y + (el.width - el.left ) * Math.cos(direction) + offset * Math.sin(direction)
                    }, direction + Math.PI / 2));
                }
                for (let i = 0, offset = this.padding; i < odd.length; i++) {
                    objects.push(...this.computePositions(odd[i], {
                        x: position.x - el.right * Math.sin(direction) + offset * Math.cos(direction),
                        y: position.y + el.right * Math.cos(direction) + offset * Math.sin(direction)
                    }, direction - Math.PI / 2));
                    offset += this.padding + odd[i].width;
                }
                return objects;
        }

    }

    private createNodeMesh(node: Element, x0: number, y0: number, width: number, height: number, direction: number): THREE.Object3D {
        const color = node.type === "CONTAINER" ? new THREE.Color('yellow') : new THREE.Color('green');
        const material = new THREE.MeshPhongMaterial({
            color
        });
        const geometry = new THREE.BoxGeometry(height, 30, width)
            .rotateY(direction)
            .translate(
                x0 + (Math.cos(direction) * height - Math.sin(direction) * width) / 2,
                15,
                y0 + (Math.cos(direction) * width + Math.sin(direction) * height) / 2);
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
}