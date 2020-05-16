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
        this.isLocked = true;
        this.onLock && this.onLock();
    }

    unlock() {
        this.isLocked = false;
        this.onUnlock && this.onUnlock();
    }


    private connect() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        document.addEventListener('mousedown', () => this.lock(), false);
        document.addEventListener('mouseup', () => this.unlock(), false);
        document.addEventListener('mouseout', () => this.unlock(), false);

    }

    private disconnect() {
        document.removeEventListener('mousemove', (e) => this.onMouseMove(e), false);
        document.removeEventListener('mousedown', () => this.lock(), false);
        document.removeEventListener('mouseup', () => this.unlock(), false);
        document.removeEventListener('mouseout', () => this.unlock(), false);
    }
}
