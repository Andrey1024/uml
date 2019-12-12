import { Injectable } from '@angular/core';
import { LayoutService } from './layout.service';
import { Element } from '../model/element.model';
import * as THREE from 'three';

interface Base {
    side?: 'left' | 'right';
    data: Element;
    offset?: number;
    width: number;
    length: number;
}

interface Building extends Base {
    height?: number;
}

interface Street extends Base {
    children: Array<Street | Building>;
    left: number;
    right: number;
    segments: { length: number; age: number; }[];
}

type StreetElement = Street | Building;

@Injectable()
export class StreetsService implements LayoutService {
    readonly name = 'Evo Streets';

    readonly padding = 20;

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

    place(hierarchy: Element): THREE.Object3D[] {
        const flat = this.flat(hierarchy);
        return this.computePositions(flat, { x: 0, y: -(<Street>flat).right }, 0);
    }

    private flat(el: Element, depth = 0): StreetElement {
        switch (el.type) {
            case 'CLASS':
            case 'INTERFACE':
                const size = StreetsService.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 2;
                return { width: size, length: size, data: el, offset: 0 };
            case 'ENUM':
                return { width: 15, length: 15, data: el, offset: 0 };
            case 'PACKAGE':
                const segments: { length: number; age: number; }[] = [];
                const children = el.children
                    .sort((a, b) => {
                        if (a.lifeSpan < b.lifeSpan) {
                            return 1;
                        } else if (a.lifeSpan > b.lifeSpan) {
                            return -1;
                        } else {
                            return a.name.localeCompare(b.name);
                        }
                    })
                    .map(e => this.flat(e as Element, depth + 1));
                let leftOffset = this.padding, rightOffset = this.padding, age = el.lifeSpan, lastSpan = 0;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.data.lifeSpan < age) {
                        const maxOffset = Math.max(leftOffset, rightOffset);
                        segments.push({ length: maxOffset - lastSpan, age });
                        age = child.data.lifeSpan;
                        lastSpan = leftOffset = rightOffset = maxOffset + this.padding;
                    }

                    if (leftOffset <= rightOffset) {
                        child.side = 'left';
                        child.offset = leftOffset + child.width;
                        leftOffset += child.width + this.padding;
                    } else {
                        child.side = 'right';
                        child.offset = rightOffset;
                        rightOffset += child.width + this.padding;
                    }
                }
                const length = Math.max(leftOffset, rightOffset, 0);
                segments.push({ length: length - lastSpan, age });
                const left = Math.max(...children.filter(child => child.side === 'left').map(c => c.length), 0);
                const right = Math.max(...children.filter(child => child.side === 'right').map(c => c.length), 0);
                return {
                    left, right, length,
                    width: left + 30 / (depth + 1) + right, children, data: el, segments
                };
        }
    }

    private computePositions(el: StreetElement, position: { x: number, y: number }, direction: number): THREE.Object3D[] {
        switch (el.data.type) {
            case 'CLASS':
            case 'ENUM':
            case 'INTERFACE':
                return [this.createNodeMesh(el, position.x, position.y, el.width, el.length, direction)];
            case 'PACKAGE':
                const street = el as Street;
                const objects = [];
                objects.push(this.createNodeMesh(
                    street,
                    position.x - street.right * Math.sin(direction),
                    position.y + street.right * Math.cos(direction),
                    street.width - street.left - street.right, street.length, direction
                ));
                for (let i = 0; i < street.children.length; i++) {
                    const child = street.children[i];
                    if (child.side === 'left') {
                        objects.push(...this.computePositions(child, {
                            x: position.x - (street.width - street.left) * Math.sin(
                                direction) + child.offset * Math.cos(direction),
                            y: position.y + (street.width - street.left) * Math.cos(
                                direction) + child.offset * Math.sin(direction)
                        }, direction + Math.PI / 2));
                    } else {
                        objects.push(...this.computePositions(child, {
                            x: position.x - street.right * Math.sin(direction) + child.offset * Math.cos(
                                direction),
                            y: position.y + street.right * Math.cos(direction) + child.offset * Math.sin(
                                direction)
                        }, direction - Math.PI / 2));
                    }
                }
                return objects;
        }

    }

    private createNodeMesh(node: StreetElement, x0: number, y0: number, width: number, length: number, direction: number): THREE.Object3D {
        const color = node.data.type === 'PACKAGE' ? new THREE.Color('yellow') : new THREE.Color('green');
        const material = new THREE.MeshPhongMaterial({
            color, side: THREE.DoubleSide
        });
        const old = node.data.lifeSpan * 5;
        let geometry: THREE.Geometry;
        switch (node.data.type) {
            default:
            case 'CLASS':
                geometry = new THREE.BoxGeometry(length, 20, width).translate(0, 10, 0);;
                break;
            case 'INTERFACE':
                const rad = node.width / 2;
                geometry = new THREE.CylinderGeometry(rad, rad, 20, 32, 32)
                    .translate(0, 10, 0);
                break;
            case 'PACKAGE':
                geometry = this.createContainerGeometry(node as Street);
                break;

        }
        geometry.rotateY(-direction)
            .translate(
                x0 + (Math.cos(direction) * length - Math.sin(direction) * width) / 2,
                old,
                y0 + (Math.cos(direction) * width + Math.sin(direction) * length) / 2
            );
        const mesh = new THREE.Mesh(geometry, material);
        mesh['rawObject'] = node.data;
        return mesh;
    }

    private createContainerGeometry(node: Street) {
        const geometry = new THREE.Geometry();
        const width = node.width - node.left - node.right;

        let offset = -node.length / 2;
        for (let i = 0; i < node.segments.length; i++) {
            const segment = node.segments[i];
            const plane = new THREE.Geometry();
            const z = -(node.data.lifeSpan - segment.age) * 5;
            plane.vertices.push(
                new THREE.Vector3(offset, z, -width / 2),
                new THREE.Vector3(offset, z, width / 2),
                new THREE.Vector3(offset + segment.length, z, width / 2),
                new THREE.Vector3(offset + segment.length, z, -width / 2),
            );
            plane.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 3, 0));
            geometry.merge(plane);
            offset += segment.length;

            if (i + 1 < node.segments.length) {
                const bridge = new THREE.Geometry();
                const vertices = [
                    new THREE.Vector3(offset, -(node.data.lifeSpan - segment.age) * 5,
                        -width / 2
                    ),
                    new THREE.Vector3(offset, -(node.data.lifeSpan - segment.age) * 5,
                        width / 2
                    ),
                    new THREE.Vector3(offset + this.padding,
                        -(node.data.lifeSpan - node.segments[i + 1].age) * 5, width / 2
                    ),
                    new THREE.Vector3(offset + this.padding,
                        -(node.data.lifeSpan - node.segments[i + 1].age) * 5, -width / 2
                    ),
                ];
                offset += this.padding;

                bridge.vertices.push(...vertices);
                bridge.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 3, 0));
                geometry.merge(bridge);

            }
        }
        geometry.computeFaceNormals();
        return geometry;
    }
}
