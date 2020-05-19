import * as THREE from 'three';
import { Point } from "./point";

export abstract class Shape {
    public geometry: THREE.BufferGeometry;

    protected translation = new THREE.Vector3();
    protected rotation: number = 0;

    protected finalized = false;

    public parent?: Shape;


    protected pickId: number;

    public padding = { xNeg: 0, xPos: 0, zNeg: 0, zPos: 0, yNeg: 0, yPos: 0 };

    public get dimensions(): Point {
        const dimensions = this.size;
        return {
            x: dimensions.x + this.padding.xNeg + this.padding.xPos,
            y: dimensions.y + this.padding.yNeg + this.padding.yPos,
            z: dimensions.z + this.padding.zNeg + this.padding.zPos
        }
    }

    public abstract get size(): Point;

    public andPickId(pickId: number): this {
        this.pickId = pickId;
        return this;
    }

    public andTranslate(x: number, y: number, z: number): this {
        this.translation.add(new THREE.Vector3(x, y, z));
        return this;
    }

    public andRotate(radian: number): this {
        this.rotation = radian;
        return this;
    }

    public andPaddingX(padding: number): this {
        this.padding.xNeg = this.padding.xPos = padding;
        return this;
    }

    public andPaddingY(padding: number): this {
        this.padding.yNeg = this.padding.yPos = padding;
        return this;
    }

    public andPaddingZ(padding: number): this {
        this.padding.zPos = this.padding.zNeg = padding;
        return this;
    }

    public andPadding(padding: number): this {
        this.padding.zPos = this.padding.zNeg
            = this.padding.xNeg = this.padding.xPos
            = this.padding.yNeg = this.padding.yPos = padding;
        return this;
    }

    public get transform(): THREE.Matrix4 {
        return new THREE.Matrix4().compose(
            this.translation,
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation),
            new THREE.Vector3(1, 1, 1)
        );
    }

    public static setColor(geometry: THREE.BufferGeometry, color: THREE.Color) {
        const position = geometry.attributes.position;
        const colors = [];

        for (let i = 0; i < position.count; i++) {
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }

    public andColor(color: THREE.Color): this {
        Shape.setColor(this.geometry, color);
        return this;
    }

    public finalize(): THREE.BufferGeometry {
        if (!this.finalized) {
            this.geometry.applyMatrix4(this.transform);
            this.finalized = true;
        }
        return this.geometry;
    }

    public getPickGeometry(): THREE.BufferGeometry {
        if (!this.finalized) {
            throw "Should first finalize before get picking geometry";
        }
        const pickGeometry = this.geometry.clone();
        Shape.setColor(pickGeometry, new THREE.Color().setHex(this.pickId));
        return pickGeometry;
    }

    protected abstract createHighLightGeometry(): THREE.BufferGeometry;

    public getHighLightGeometry(): THREE.BufferGeometry {
        if (!this.finalized) {
            throw "Should first finalize before get picking geometry";
        }
        const geometry = this.createHighLightGeometry().applyMatrix4(this.transform);
        let parentShape = this.parent;
        while (parentShape) {
            geometry.applyMatrix4(parentShape.transform);
            parentShape = parentShape.parent;
        }
        return geometry;
    }

}