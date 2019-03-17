import * as THREE from "three";
import "../../utils/EnableThreeExamples";

export class CameraControl {
    public controls;

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;

    constructor(camera: THREE.Camera) {
        // @ts-ignore
        this.controls = new THREE.PointerLockControls(this.camera);

    }

    update(delta: number) {

    }

}