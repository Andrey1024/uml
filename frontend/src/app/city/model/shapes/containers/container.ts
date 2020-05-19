import { Shape } from "../shape";
import * as THREE from 'three';
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { BufferGeometry } from "three";

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
            if (this.children.length === 0) {
                this.finalized = true;
                return null;
            }
            this.geometry = BufferGeometryUtils.mergeBufferGeometries(this.children
                .map(child => child.finalize()).filter(geometry => geometry !== null));
        }
        return super.finalize();
    }

    public getPickGeometry(): THREE.BufferGeometry {
        return this.pickId ? super.getPickGeometry() : BufferGeometryUtils.mergeBufferGeometries(this.children.map(child => child.getPickGeometry()))
            .applyMatrix4(this.transform);
    }

    protected createHighLightGeometry(): BufferGeometry {
        return null;
    }

    public getHighLightGeometry(): BufferGeometry {
        return BufferGeometryUtils.mergeBufferGeometries(this.children.map(child => child.getHighLightGeometry()))
    }
}