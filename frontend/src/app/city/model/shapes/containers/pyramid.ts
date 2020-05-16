import { Container } from "./container";
import { Shape } from "../shape";
import { Point } from "../point";

export class Pyramid extends Container {
    get size(): Point {
        let x = 0, y = 0, z = 0;
        for (let child of this.children) {
            const dim = child.dimensions;
            x = Math.max(x, dim.x);
            z = Math.max(z, dim.z);
            y += dim.y;
        }
        return { x, y, z };
    }

    constructor(objects: Shape[]) {
        super(objects);
    }

    public finalize() {
        this.positionElements()
        return super.finalize();
    }

    private positionElements() {
        let offset = 0;
        const selfDimensions = this.dimensions;
        for (const object of this.children) {
            const { y } = object.dimensions;
            object.andTranslate(0, (y - selfDimensions.y) / 2 + offset, 0);
            offset += y;
        }
    }
}