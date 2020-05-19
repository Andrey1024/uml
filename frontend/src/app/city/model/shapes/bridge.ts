import { Shape } from "./shape";
import { Point } from "./point";
import * as THREE from "three";

export class Bridge extends Shape {
    get size(): Point {
        return {
            x: this.length,
            y: 0,
            z: this.width
        };
    }

    constructor(protected length: number, private width: number, private elevationFrom: number, private elevationTo: number) {
        super();
        this.geometry = new THREE.BufferGeometry();
        const vertices = [
            -length / 2, elevationFrom, -width / 2,
            -length / 2, elevationFrom, width / 2,
            length / 2, elevationTo, width / 2,
            length / 2, elevationTo, -width / 2
        ];
        this.geometry.setIndex([0, 1, 2, 2, 3, 0])
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(8).fill(0), 2))
        this.geometry.computeVertexNormals();

    }

    protected createHighLightGeometry(): THREE.BufferGeometry {
        return null;
    }
}