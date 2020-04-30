import { Injectable } from '@angular/core';
import { DisplayOptions, LayoutService } from './layout.service';
import * as THREE from 'three';
import { Hierarchy } from "../model/hierarchy.model";
import { first, map } from "lodash-es";
import { Element } from "../model/server-model/element";
import { NodeModel } from "../model/server-model/node.model";
import { Store } from "@ngxs/store";
import { CommitsState } from "../state/commits.state";

interface UserData {
    width: number;
    height: number;
    length: number;
    lifeRatio: number;
    name: string;
    data: { type: string, name: string };
}

@Injectable()
export class StreetsService implements LayoutService {
    readonly name = 'Evo Streets';

    readonly padding = 20;

    authorColors = new Map<string, THREE.Color>();

    constructor(private store: Store) {
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


    private getAuthorColor(author: string): THREE.Color {
        const authorsHsl = this.store.selectSnapshot(CommitsState.getAuthorsHSL);
        if (!this.authorColors.has(author)) {
            this.authorColors.set(author, new THREE.Color(`hsl(${authorsHsl[author]}, 100%, 50%)`));
        }
        return this.authorColors.get(author);
    }

    place(hierarchy: Hierarchy, options: DisplayOptions): THREE.Object3D[] {
        const res = this.process(hierarchy, options);
        res.updateMatrixWorld();
        return [res];
    }

    private process(hierarchy: any, options: DisplayOptions, name: string = null, depth = 1): THREE.Object3D {
        return hierarchy.type
            ? options.showAuthors ? this.createAuthorMesh(hierarchy, options.selectedAuthors) : this.createElementMesh(hierarchy)
            : this.createPackageMesh(map(hierarchy, (v, k) =>
                this.process(v, options, name ? `${name}.${k}` : k, depth + 1)), name, depth);
    }

    private getElementProps(el: Element): { size: number, height: number } {
        switch (el.type) {
            case "CLASS":
            case "INTERFACE":
                return {
                    size: StreetsService.closeValue(el.attributesCount, 10, 20, 30, 40, 50) * 2,
                    height: StreetsService.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 3
                };
            default:
                return {
                    size: 10, height: 10
                }
        }
    }

    private createAuthorMesh(node: NodeModel, selectedAuthors: string[]): THREE.Object3D {
        const props = this.getElementProps(node as Element);
        const result = new THREE.Group();
        const authors = selectedAuthors
            .map(key => ({ author: key, count: node.authors[key] }))
            .filter(author => author.count > 0)
            .sort((a, b) => b.count - a.count).slice(0, 10);
        let offset = node.lifeRatio * 50;
        for (let i = 0; i < authors.length; i++) {
            const color = this.getAuthorColor(authors[i].author);
            const material = new THREE.MeshPhongMaterial({
                color, side: THREE.DoubleSide
            });
            let geometry: THREE.Geometry;
            const height = StreetsService.closeValue(authors[i].count, 1, 10, 20, 30, 40);
            switch (node.type) {
                default:
                case 'CLASS':
                    geometry = new THREE.BoxGeometry(props.size, height, props.size)
                        .translate(0, height / 2 + offset, 0);
                    break;
                case 'INTERFACE':
                    const rad = props.size / 2;
                    geometry = new THREE.CylinderGeometry(rad, rad, height, 32, 32)
                        .translate(0, height / 2 + offset, 0);
                    break;
            }
            const mesh = new THREE.Mesh(geometry, material);
            mesh.matrixAutoUpdate = false;
            mesh.matrixWorldNeedsUpdate = true;
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            result.add(mesh);
            offset += height;
        }
        result.name = node.fullPath;
        result.matrixAutoUpdate = false;
        result.userData = <UserData> {
            width: props.size,
            length: props.size,
            lifeRatio: node.lifeRatio,
            name: node.fullPath,
            height: offset,
            data: node
        };
        return result;

    }

    private createElementMesh(node: Element): THREE.Object3D {
        const props = this.getElementProps(node);
        const color = new THREE.Color('green');
        const material = new THREE.MeshPhongMaterial({
            color, side: THREE.DoubleSide
        });
        let geometry: THREE.Geometry;
        switch (node.type) {
            default:
            case 'CLASS':
                geometry = new THREE.BoxGeometry(props.size, props.height, props.size)
                    .translate(0, props.height / 2 + node.lifeRatio * 50, 0);
                break;
            case 'INTERFACE':
                const rad = props.size / 2;
                geometry = new THREE.CylinderGeometry(rad, rad, props.height, 32, 32)
                    .translate(0, props.height / 2 + node.lifeRatio * 50, 0);
                break;
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = node.fullPath;
        mesh.matrixAutoUpdate = false;
        mesh.userData = <UserData> {
            width: props.size,
            length: props.size,
            lifeRatio: node.lifeRatio,
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
            if (a.userData.lifeRatio < b.userData.lifeRatio) {
                return 1;
            } else if (a.userData.lifeRatio > b.userData.lifeRatio) {
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
            if (childData.lifeRatio < lastAge) {
                const maxOffset = Math.max(leftOffset, rightOffset);
                geometry.merge(createSegment(lastSegment, maxOffset - lastSegment, lastAge * 50));
                geometry.merge(createBridge(maxOffset, lastAge * 50, childData.lifeRatio * 50));
                lastSegment = leftOffset = rightOffset = maxOffset + this.padding;
            }

            if (leftOffset <= rightOffset) {
                children[i].applyMatrix(new THREE.Matrix4()
                    .makeTranslation((childData.length + width) / 2, 0, leftOffset + childData.width / 2));
                children[i].applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 2));
                leftOffset += childData.width + this.padding;
                left = Math.max(left, childData.length);
            } else {
                children[i].applyMatrix(new THREE.Matrix4()
                    .makeTranslation((childData.length + width) / 2, 0, -rightOffset - childData.width / 2));
                children[i].applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
                rightOffset += childData.width + this.padding;
                right = Math.max(right, childData.length);
            }
            children[i].matrixWorldNeedsUpdate = true;
            lastAge = childData.lifeRatio;
        }

        const lifeRatio = Math.max(...children.map(c => c.userData.lifeRatio));
        const length = Math.max(leftOffset, rightOffset) + this.padding;
        geometry.merge(createSegment(lastSegment, length - lastSegment, lastAge * 50));
        geometry.computeFaceNormals();


        const color = new THREE.Color('yellow');
        const material = new THREE.MeshPhongMaterial({
            color, side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
        packageGroup.add(mesh, ...children);
        packageGroup.applyMatrix(new THREE.Matrix4().makeTranslation(-length / 2, 0, (left - right) / 2));

        if (name !== null) {
            mesh.userData = { data: { type: 'PACKAGE', name } };
            packageGroup.userData = <UserData> {
                width: width + left + right,
                length,
                height: (lifeRatio - lastAge) * 50,
                lifeRatio,
                name,
                data: { type: 'PACKAGE', name }
            };
        }

        return packageGroup;
    }
}
