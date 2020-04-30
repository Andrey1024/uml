import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { DisplayOptions, LayoutService } from './layout.service';
import { map } from 'lodash-es';
import { Overlay } from '@angular/cdk/overlay';
import { FontService } from './font.service';
import { Hierarchy } from "../model/hierarchy.model";
import { Element } from "../model/server-model/element";
import { Grid } from "../model/grid.model";
import { NodeModel } from "../model/server-model/node.model";
import { Store } from "@ngxs/store";
import { CommitsState } from "../state/commits.state";

interface UserData {
    width: number;
    length: number;
    height: number;
    lifeRatio: number;
    name: string;
    data: { type: string, name: string };
}

@Injectable()
export class CityService implements LayoutService {
    readonly name = '3D City';

    readonly padding = 10;

    authorColors = new Map<string, THREE.Color>();

    constructor(private store: Store) {
    }

    private static closeValue(value: number, ...steps: number[]): number {
        let i = 0;
        while (value > steps[i] && steps.length > i + 1) {
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


    private process(hierarchy: any, options: DisplayOptions, name: string = null): THREE.Object3D {
        return hierarchy.type
            ? options.showAuthors ? this.createAuthorMesh(hierarchy, options.selectedAuthors) : this.createElementMesh(hierarchy)
            : this.createPackageMesh(map(hierarchy, (v, k) => this.process(v, options, name ? `${name}.${k}` : k)), name);
    }

    private getElementProps(el: Element): { size: number, height: number } {
        switch (el.type) {
            case "CLASS":
            case "INTERFACE":
                return {
                    size: CityService.closeValue(el.attributesCount, 10, 20, 30, 40, 50) * 2,
                    height: CityService.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 3
                };
            default:
                return {
                    size: 10, height: 40
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
        let offset = 0;
        for (let i = 0; i < authors.length; i++) {
            const color = this.getAuthorColor(authors[i].author);
            const material = new THREE.MeshPhongMaterial({
                color, side: THREE.DoubleSide
            });
            let geometry: THREE.Geometry;
            const height = CityService.closeValue(authors[i].count, 1, 10, 20, 30, 40);
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
            mesh.userData = <UserData> {
                width: props.size + this.padding * 2,
                length: props.size + this.padding * 2,
                lifeRatio: node.lifeRatio,
                name: node.fullPath,
                height: offset,
                data: node
            };
            result.add(mesh);
            offset += height;
        }
        result.name = node.fullPath;
        result.matrixAutoUpdate = false;
        result.userData = <UserData> {
            width: props.size + this.padding * 2,
            length: props.size + this.padding * 2,
            lifeRatio: node.lifeRatio,
            name: node.fullPath,
            height: offset,
            data: node
        };
        return result;

    }

    private createElementMesh(node: Element): THREE.Object3D {
        const props = this.getElementProps(node);
        const color = new THREE.Color("yellow").lerp(new THREE.Color("blue"), node.lifeRatio);
        const material = new THREE.MeshPhongMaterial({
            color, side: THREE.DoubleSide
        });
        let geometry: THREE.Geometry;
        switch (node.type) {
            default:
            case 'CLASS':
                geometry = new THREE.BoxGeometry(props.size, props.height, props.size)
                    .translate(0, props.height / 2, 0);
                break;
            case 'INTERFACE':
                const rad = props.size / 2;
                geometry = new THREE.CylinderGeometry(rad, rad, props.height, 32, 32)
                    .translate(0, props.height / 2, 0);
                break;
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = node.fullPath;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
        mesh.userData = <UserData> {
            width: props.size + this.padding * 2,
            length: props.size + this.padding * 2,
            lifeRatio: node.lifeRatio,
            name: node.fullPath,
            height: props.height,
            data: node
        };
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        return mesh;
    }

    private createPackageMesh(objects: THREE.Object3D[], name: string): THREE.Object3D {
        const children = [...objects.sort((a, b) => {
            if (a.userData.length < b.userData.length) {
                return 1;
            } else if (a.userData.length > b.userData.length) {
                return -1;
            } else if (a.userData.width < b.userData.width) {
                return 1;
            } else if (a.userData.width > b.userData.width) {
                return -1;
            } else {
                return a.userData.name.localeCompare(b.userData.name);
            }
        })];
        const lifeRatio = Math.max(...children.map(c => c.userData.lifeRatio));


        const grid = new Grid(children);
        const packageGroup = grid.finalize();
        const packageSize = grid.dimensions;

        const color = new THREE.Color("yellow").lerp(new THREE.Color("blue"), lifeRatio);
        const material = new THREE.MeshPhongMaterial({ color });
        const geometry = name === null
            ? new THREE.PlaneGeometry(packageSize.x, packageSize.z).rotateX(-Math.PI / 2)
            : new THREE.BoxGeometry(packageSize.x, 30, packageSize.z).translate(0, -15, 0);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
        mesh.receiveShadow = true;
        packageGroup.add(mesh);
        packageGroup.applyMatrix(new THREE.Matrix4().makeTranslation(0, 30, 0));

        if (name !== null) {
            mesh.userData = { data: { type: 'PACKAGE', name } };
            packageGroup.userData = <UserData> {
                length: packageSize.x + this.padding * 2,
                width: packageSize.z + this.padding * 2,
                height: packageSize.y + 30,
                lifeRatio,
                name
            };
        }

        return packageGroup;
    }

    // private createTitleMesh(node: HierarchyCityNode): THREE.Mesh {
    //     if (!node.data.name
    //         // || node.data.type !== 'PACKAGE'
    //         || (node.x1 - node.x0) < 5 * node.data.name.length) {
    //         return;
    //     }
    //     const material = new THREE.MeshBasicMaterial({
    //         color: new THREE.Color('white')
    //     });
    //     const geometry = new THREE.TextGeometry(node.data.name, {
    //         font: this.font,
    //         size: 5,
    //         height: 0.01
    //     });
    //     const mesh = new THREE.Mesh(geometry, material);
    //     mesh.position.set(node.x0 - this.citySize, node.z1 - 10, node.y1 - this.citySize);
    //     node.figure.add(mesh);
    // }

}
