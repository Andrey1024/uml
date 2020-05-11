import { Shape } from "./shape";
import * as THREE from "three";

export class Cylinder extends Shape {
    constructor(private rad: number, private height: number) {
        super();
        this.geometry = new THREE.CylinderBufferGeometry(rad, rad, height, 32, 32);
    }
}