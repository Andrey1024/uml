import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { LayoutService } from './layout.service';
import { map } from 'lodash-es';
import { Overlay } from '@angular/cdk/overlay';
import { FontService } from './font.service';
import { Hierarchy } from "../model/hierarchy.model";
import { ElementModel } from "../model/server-model/element.model";
import { Grid } from "../model/grid.model";

interface UserData {
    width: number;
    length: number;
    height: number;
    lifeSpan: number;
    name: string;
    data: { type: string, name: string };
}

@Injectable()
export class CityService implements LayoutService {
    readonly name = '3D City';

    readonly padding = 10;


    font = this.fontService.font;

    constructor(private overlay: Overlay, private fontService: FontService) {
    }

    private static closeValue(value: number, ...steps: number[]): number {
        let i = 0;
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

    private process(hierarchy: any, name: string = ''): THREE.Object3D {
        return hierarchy.type
            ? this.createElementMesh(hierarchy)
            : this.createPackageMesh(map(hierarchy, (v, k) => this.process(v, k)), name);
    }

    private getElementProps(el: ElementModel): { size: number, height: number } {
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


    private createElementMesh(node: ElementModel): THREE.Object3D {
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
            lifeSpan: node.lifeSpan,
            name: node.fullPath,
            height: props.height,
            data: node
        };
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

        const grid = new Grid(children);
        const packageGroup = grid.finalize();
        const packageSize = grid.dimensions;

        const color = new THREE.Color('blue');
        const material = new THREE.MeshPhongMaterial({ color });
        const geometry = new THREE.BoxGeometry(packageSize.x, 30, packageSize.z).translate(0, -15, 0);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
        mesh.userData = { data: { type: 'PACKAGE', name } };
        packageGroup.add(mesh);
        packageGroup.applyMatrix(new THREE.Matrix4().makeTranslation(0, 15, 0));

        packageGroup.userData = <UserData> {
            length: packageSize.x + this.padding * 2,
            width: packageSize.z + this.padding * 2,
            height: packageSize.y + 30,
            name,
            data: { type: 'PACKAGE', name }
        };

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
