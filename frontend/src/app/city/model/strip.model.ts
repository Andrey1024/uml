import * as THREE from 'three';

export class Strip {
    private strip = new THREE.Group();
    private objects: THREE.Object3D[] = []

    constructor() {
        this.strip.matrixAutoUpdate = false;
        this.strip.matrixWorldNeedsUpdate = true;
    }

    public get dimensions(): THREE.Vector3 {
        const vector = new THREE.Vector3();
        for (let child of this.objects) {
            vector.setX(vector.x + child.userData.length);
            vector.setZ(Math.max(vector.z, child.userData.width));
            vector.setY(Math.max(vector.y, child.userData.height));
        }
        return vector;
    }

    public addObject(object: THREE.Object3D) {
        this.objects.push(object);
    }

    public finalize(): THREE.Object3D {
        this.positionElements()
        return this.strip;
    }

    private positionElements() {
        let offset = 0;
        const stripDimensions = this.dimensions;
        for (const object of this.objects) {
            const { length, width, height } = object.userData;
            object.applyMatrix(new THREE.Matrix4().makeTranslation(
                (length - stripDimensions.x) / 2 + offset, 0, (width - stripDimensions.z) / 2
            ));
            offset += length;
            this.strip.add(object);
        }

    }
}