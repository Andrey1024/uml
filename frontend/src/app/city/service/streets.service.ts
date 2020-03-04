import { Injectable } from '@angular/core';
import { LayoutService } from './layout.service';
import * as THREE from 'three';
import { Hierarchy } from "../model/hierarchy.model";
import { first, map } from "lodash-es";
import { ElementModel } from "../model/server-model/element.model";

interface Base {
    side?: 'left' | 'right';
    offset?: number;
    width: number;
    length: number;
}

interface Building extends Base {
    height?: number;
    data: ElementModel;
}

interface Street extends Base {
    children: Array<Street | Building>;
    data: string;
    left: number;
    right: number;
    segments: { length: number; age: number; }[];
}

interface UserData {
    width: number;
    height: number;
    length: number;
    lifeSpan: number;
    name: string;
    data: { type: string, name: string };
}

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

    place(hierarchy: Hierarchy): THREE.Object3D[] {
        const res = this.process(hierarchy);
        res.updateMatrixWorld();
        return [res];
    }

    private process(hierarchy: any, name: string = '', depth = 1): THREE.Object3D {
        return hierarchy.type
            ? this.createElementMesh(hierarchy)
            : this.createPackageMesh(map(hierarchy, (v, k) => this.process(v, k, depth + 1)), name, depth);
    }

    private getElementProps(el: ElementModel): { width: number, height: number } {
        switch (el.type) {
            case "CLASS":
            case "INTERFACE":
                return {
                    width: StreetsService.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 2,
                    height: 10
                };
            default:
                return {
                    width: 10, height: 10
                }
        }
    }

    private createElementMesh(node: ElementModel): THREE.Object3D {
        const props = this.getElementProps(node);
        const color = new THREE.Color('green');
        const material = new THREE.MeshPhongMaterial({
            color, side: THREE.DoubleSide
        });
        const old = node.lifeSpan * 5;
        let geometry: THREE.Geometry;
        switch (node.type) {
            default:
            case 'CLASS':
                geometry = new THREE.BoxGeometry(props.width, props.height, props.width)
                    .translate(0, node.lifeSpan * 5, 0);
                break;
            case 'INTERFACE':
                const rad = props.width / 2;
                geometry = new THREE.CylinderGeometry(rad, rad, props.height, 32, 32)
                    .translate(0, node.lifeSpan * 5, 0);
                break;
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = node.fullPath;
        mesh.matrixAutoUpdate = false;
        mesh.userData = <UserData> {
            width: props.width,
            length: props.width,
            lifeSpan: node.lifeSpan,
            name: node.fullPath,
            height: props.height,
            data: node
        };
        return mesh;
    }

    private createPackageMesh(objects: THREE.Object3D[], name: string, depth: number): THREE.Object3D {
        const packageGroup = new THREE.Group();
        packageGroup.matrixAutoUpdate = false;
        packageGroup.matrixWorldNeedsUpdate = true;
        const children = objects.sort((a, b) => {
            if (a.userData.lifeSpan < b.userData.lifeSpan) {
                return 1;
            } else if (a.userData.lifeSpan > b.userData.lifeSpan) {
                return -1;
            } else {
                return a.userData.name.localeCompare(b.userData.name);
            }
        });

        const geometry = new THREE.Geometry();
        const width = 30 / depth + 1;

        const createSegment = (offset: number, length: number, level: number) => {

            const plane = new THREE.Geometry();
            plane.vertices.push(
                new THREE.Vector3(offset, level, -width / 2),
                new THREE.Vector3(offset, level, width / 2),
                new THREE.Vector3(offset + length, level, width / 2),
                new THREE.Vector3(offset + length, level, -width / 2)
            );
            plane.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 3, 0));
            return plane;
        };

        const createBridge = (offset, fromHeight: number, toHeight: number) => {
            const bridge = new THREE.Geometry();
            bridge.vertices.push(
                new THREE.Vector3(offset, fromHeight, -width / 2),
                new THREE.Vector3(offset, fromHeight, width / 2),
                new THREE.Vector3(offset + this.padding, toHeight, width / 2),
                new THREE.Vector3(offset + this.padding, toHeight, -width / 2)
            );
            bridge.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 3, 0));
            return bridge;
        };


        let leftOffset = this.padding, rightOffset = this.padding, lastAge = 0, lastSegment = 0, left = 0, right = 0;
        for (let i = 0; i < children.length; i++) {
            const childData = children[i].userData as UserData;
            if (childData.lifeSpan < lastAge) {
                const maxOffset = Math.max(leftOffset, rightOffset);
                geometry.merge(createSegment(lastSegment, maxOffset - lastSegment, lastAge * 5));
                geometry.merge(createBridge(maxOffset, lastAge * 5, childData.lifeSpan * 5));
                lastSegment = leftOffset = rightOffset = maxOffset + this.padding;
            }

            if (leftOffset <= rightOffset) {
                children[i].applyMatrix(new THREE.Matrix4()
                    .makeTranslation((childData.length + width) / 2, childData.height / 2, leftOffset + childData.width / 2));
                children[i].applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 2));
                leftOffset += childData.width + this.padding;
                left = Math.max(left, childData.length);
            } else {
                children[i].applyMatrix(new THREE.Matrix4()
                    .makeTranslation((childData.length + width) / 2, childData.height / 2, -rightOffset - childData.width / 2));
                children[i].applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
                rightOffset += childData.width + this.padding;
                right = Math.max(right, childData.length);
            }
            children[i].matrixWorldNeedsUpdate = true;
            lastAge = childData.lifeSpan;
        }

        const lifeSpan = first(children).userData.lifeSpan;
        const length = Math.max(leftOffset, rightOffset) + this.padding;
        geometry.merge(createSegment(lastSegment, length - lastSegment, lastAge * 5));
        geometry.computeFaceNormals();


        const color = new THREE.Color('yellow');
        const material = new THREE.MeshPhongMaterial({
            color, side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
        mesh.userData = {data: {type: 'PACKAGE', name}};
        packageGroup.add(mesh, ...children);
        packageGroup.applyMatrix(new THREE.Matrix4().makeTranslation(-length / 2, -(lifeSpan - lastAge) * 2.5, (left - right) / 2));


        packageGroup.userData = <UserData> {
            width: width + left + right,
            length,
            height: (lifeSpan - lastAge) * 5,
            lifeSpan,
            name,
            data: {type: 'PACKAGE', name}
        };

        return packageGroup;
    }
}
