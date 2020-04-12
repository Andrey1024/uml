import { Injectable, InjectionToken } from '@angular/core';
import * as THREE from 'three';
import { LayoutService } from './layout.service';
import * as d3 from 'd3-hierarchy';
import { HierarchyRectangularNode, TreemapLayout } from 'd3-hierarchy';
import { last, map } from 'lodash-es';
import { Overlay } from '@angular/cdk/overlay';
import { FontService } from './font.service';
import { Hierarchy } from "../model/hierarchy.model";
import { ElementModel } from "../model/server-model/element.model";

interface Treemap {
    offsetX: number;
    offsetY: number;
    X: number;
    Y: number;
    parent?: Treemap;
    children: Treemap[];
}


interface UserData {
    X: number;
    Y: number;
    Z: number;
    lifeSpan: number;
    name: string;
    data: { type: string, name: string };
}

@Injectable()
export class CityService implements LayoutService {
    readonly name = '3D City';

    readonly padding = 20;


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

    private process(hierarchy: any, name: string = '', depth = 1): THREE.Object3D {
        return hierarchy.type
            ? this.createElementMesh(hierarchy)
            : this.createPackageMesh(map(hierarchy, (v, k) => this.process(v, k, depth + 1)), name, depth);
    }



    // private getCharacteristics(node: HierarchyCityNode): { height: number, color: THREE.Color } {
    //     let height = 0;

    //     switch (node.data.type) {
    //         case 'CLASS':
    //         case 'INTERFACE':
    //             // height = Math.max(node.data.methodsCount * 5, 15);
    //             height = CityService.closeValue(node.data.methodsCount, 2, 4, 8, 16, 32) * 5;
    //             break;
    //     }

    //     const sampleNumber = last(node.ancestors()).data.lifeSpan;
    //     const color = new THREE.Color('yellow').lerp(new THREE.Color('blue'), node.data.lifeSpan / (sampleNumber + 1));

    //     return { height, color };
    // }

    private getElementProps(el: ElementModel): { width: number, height: number } {
        switch (el.type) {
            case "CLASS":
            case "INTERFACE":
                return {
                    width: CityService.closeValue(el.methodsCount, 10, 20, 30, 40, 50) * 2,
                    height: 40
                };
            default:
                return {
                    width: 10, height: 40
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
                geometry = new THREE.BoxGeometry(props.width, props.height, props.width)
                    .translate(0, props.height / 2, 0);
                break;
            case 'INTERFACE':
                const rad = props.width / 2;
                geometry = new THREE.CylinderGeometry(rad, rad, props.height, 32, 32)
                    .translate(0, props.height / 2, 0);
                break;
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = node.fullPath;
        mesh.matrixAutoUpdate = false;
        mesh.userData = <UserData>{
            X: props.width,
            Y: props.width,
            lifeSpan: node.lifeSpan,
            name: node.fullPath,
            Z: props.height,
            data: node
        };
        return mesh;
    }

    private createPackageMesh(objects: THREE.Object3D[], name: string, depth: number): THREE.Object3D {
        const packageGroup = new THREE.Group();
        packageGroup.matrixAutoUpdate = false;
        packageGroup.matrixWorldNeedsUpdate = true;

        const children = [...objects.sort((a, b) => {
            if (a.userData.depth < b.userData.depth) {
                return 1;
            } else if (a.userData.depth > b.userData.depth) {
                return -1;
            } else if (a.userData.width < b.userData.width) {
                return 1;
            } else if (a.userData.width > b.userData.width) {
                return -1;
            } else {
                return a.userData.name.localeCompare(b.userData.name);
            }
        })];


        const root: Treemap = { Y: 0, X: Number.MAX_VALUE, offsetX: 0, offsetY: 0, children: [] };
        let width = this.padding, height = this.padding

        function findLine(r: Treemap, w: number, h: number): Treemap {
            if (r.children && r.children.length) {
                let i = r.children.length - 1;
                while (i >= 0) {
                    const l = findLine(r.children[i], w, h);
                    if (l) {
                        return l;
                    }
                    i--;
                }
            }
            if (r === root) {
                return null;
            }
            const availableWidth = r.parent.X - (r.offsetX - r.parent.offsetX);
            return availableWidth >= w && r.Y >= h ? r : null;
        }

        while (children.length > 0) {
            const object = children.shift();
            const userData = object.userData as UserData;
            let line = findLine(root, userData.X, userData.Y);
            if (!line) {
                line = { Y: userData.Y + this.padding, X: this.padding, offsetX: 0, offsetY: 0, parent: root, children: [] };
                width += userData.X + this.padding;
                height += userData.Y + this.padding;
                root.children.push(line);
            } else if (line.parent === root && width + userData.X > height + userData.Y) {
                const first = line;
                line = { Y: userData.Y + this.padding, X: this.padding, offsetX: 0, offsetY: height + this.padding, parent: first, children: [] };
                first.children.push(line);
                height += userData.Y + this.padding;
            } else {
                if (userData.Y + this.padding * 2 < line.Y ) {
                    const newLine = {
                        parent: line,
                        offsetX: line.offsetX + line.X + this.padding,
                        offsetY: line.offsetY + (line.Y - userData.Y) + this.padding,
                        X: this.padding, Y: line.Y - userData.Y,
                        children: []
                    }
                    line.children.push(newLine);
                }
            }

            object.applyMatrix(new THREE.Matrix4().makeTranslation(
                line.offsetX + line.X + userData.X / 2, 0, line.offsetY + userData.Y / 2
            ));
            object.matrixWorldNeedsUpdate = true;
            line.X += userData.X + this.padding;
        }



        // let width = 0, height = 0, offsetX = this.padding, offsetY = this.padding;
        // for (let i = 0; i < children.length; i++) {
        //     const childData = children[i].userData as UserData;
        //     if (offsetX < offsetY) {
        //         children[i].applyMatrix(new THREE.Matrix4().makeTranslation(
        //             (offsetX + childData.width) / 2, childData.height / 2, (offsetY + childData.depth) / 2
        //         ))
        //         offsetX
        //     }
        // }

        const color = new THREE.Color('blue');
        const material = new THREE.MeshPhongMaterial({ color });
        const geometry = new THREE.BoxGeometry(width, 30, height)
            .translate(width / 2, -15, height / 2);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
        mesh.userData = { data: { type: 'PACKAGE', name } };
        packageGroup.add(mesh, ...objects);
        packageGroup.applyMatrix(new THREE.Matrix4().makeTranslation(- width / 2, 30, - height / 2));

        packageGroup.userData = <UserData>{
            X: width,
            Y: height,
            Z: 30,
            // lifeSpan,
            name,
            data: { type: 'PACKAGE', name }
        };

        return packageGroup;
    }

    // private createNodeMesh(node: HierarchyCityNode, color: THREE.Color) {
    //     const y = node.y1 - node.y0;
    //     const x = node.x1 - node.x0;
    //     const z = node.z1 - node.z0;
    //     const material = new THREE.MeshPhongMaterial({
    //         color
    //     });
    //     let geometry;
    //     if (node.data.type === 'INTERFACE') {
    //         const rad = Math.min(x, y) / 2;
    //         geometry = new THREE.CylinderGeometry(rad, rad, z, 32, 32)
    //             .translate(node.x0 + x / 2 - this.citySize, node.z0 + z / 2, node.y0 + y / 2 - this.citySize);
    //     } else {
    //         geometry = new THREE.BoxGeometry(node.x1 - node.x0, z, node.y1 - node.y0)
    //             .translate(node.x0 + x / 2 - this.citySize, node.z0 + z / 2, node.y0 + y / 2 - this.citySize);
    //     }
    //     const mesh = new THREE.Mesh(geometry, material);
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     node.figure = mesh;
    //     node.figure['rawObject'] = node.data;
    // }

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
