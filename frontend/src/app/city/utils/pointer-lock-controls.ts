import * as THREE from 'three';

export class PointerLockControls {
    domElement = document.body;
    isLocked = false;

    euler = new THREE.Euler(0, 0, 0, 'YXZ');

    PI_2 = Math.PI / 2;

    onLock: () => void;
    onUnlock: () => void;

    constructor(private camera: THREE.Camera) {
        this.connect();
    }

    onMouseMove(event) {

        if (!this.isLocked) {
            return;
        }

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.euler.setFromQuaternion(this.camera.quaternion);

        this.euler.y -= movementX * 0.002;
        this.euler.x -= movementY * 0.002;

        this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));

        this.camera.quaternion.setFromEuler(this.euler);
    }

    dispose() {
        this.disconnect();
    }

    getObject = () => this.camera;

    lock() {
        this.onLock && this.onLock();
        this.domElement.requestPointerLock();
    }

    unlock() {
        this.onUnlock && this.onUnlock();
        document.exitPointerLock();
    }

    private onPointerlockChange() {
        this.isLocked = document.pointerLockElement === this.domElement;
        if (this.isLocked) {
            this.lock && this.lock();
        } else {
            this.unlock && this.unlock();
        }
    }

    private onPointerlockError() {
        console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
    }

    private connect() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        document.addEventListener('pointerlockchange', () => this.onPointerlockChange(), false);
        document.addEventListener('pointerlockerror', () => this.onPointerlockError(), false);

    }

    private disconnect() {
        document.removeEventListener('mousemove', (e) => this.onMouseMove(e), false);
        document.removeEventListener('pointerlockchange', () => this.onPointerlockChange(), false);
        document.removeEventListener('pointerlockerror', () => this.onPointerlockError(), false);
    }
}
