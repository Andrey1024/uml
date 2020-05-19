import { Shape } from "./shape";
import { Point } from "./point";
import * as THREE from 'three';

export class Plane extends Shape {
    get size(): Point {
        return {
            x: this.length,
            y: 0,
            z: this.width
        };
    }

    constructor(protected length: number, private width: number, private elevation: number) {
        super();
        this.geometry = new THREE.BufferGeometry();
        const vertices = [
            -length / 2, elevation, -width / 2,
            -length / 2, elevation, width / 2,
            length / 2, elevation, width / 2,
            length / 2, elevation, -width / 2
        ];
        this.geometry.setIndex([0, 1, 2, 2, 3, 0])
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(8).fill(0), 2))
        this.geometry.computeVertexNormals();
    }

    protected createHighLightGeometry(): THREE.BufferGeometry {
        return new THREE.BoxBufferGeometry(this.length, 2, this.width).translate(0, this.elevation, 0);
    }


}