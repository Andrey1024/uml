import { Shape } from "./shape";
import * as THREE from "three";
import { Point } from "./point";

export class Cylinder extends Shape {
    get size(): Point {
        return {
            x: this.rad * 2,
            y: this.height,
            z: this.rad * 2
        };
    }

    constructor(private rad: number, private height: number) {
        super();
        this.geometry = new THREE.CylinderBufferGeometry(rad, rad, height, 32, 32);
    }

    protected createHighLightGeometry(): THREE.BufferGeometry {
        return new THREE.CylinderBufferGeometry(this.rad + 1, this.rad + 1, this.height + 1, 32, 32)
            .translate(0, 1, 0);
    }
}