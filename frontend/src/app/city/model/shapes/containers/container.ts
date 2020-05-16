import { Shape } from "../shape";
import * as THREE from 'three';
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { Box } from "../box";

export abstract class Container extends Shape {
    protected constructor(public children: Shape[]) {
        super();
        children.forEach(child => child.parent = this);
    }

    addChild(child: Shape) {
        this.children.push(child);
        child.parent = this;
    }

    finalize(): THREE.BufferGeometry {
        if (!this.finalized) {
            this.geometry = BufferGeometryUtils.mergeBufferGeometries(this.children.map(child => child.finalize()));
        }
        return super.finalize();
    }

    public getPickGeometry(): THREE.BufferGeometry {
        return this.pickId ? super.getPickGeometry() : BufferGeometryUtils.mergeBufferGeometries(this.children.map(child => child.getPickGeometry()))
            .applyMatrix4(this.transform);
    }

    createHighLightGeometry(): THREE.BufferGeometry {
        const size = this.size;
        return new THREE.BoxBufferGeometry(size.x + 1, size.y + 1, size.z + 1);
    }
}