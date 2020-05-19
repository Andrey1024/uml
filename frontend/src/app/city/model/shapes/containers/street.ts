import { StreetSide } from "./street-side";
import { Shape } from "../shape";
import { Container } from "./container";
import { Point } from "../point";

export class Street extends Container {
    constructor(public elevation: number, left: StreetSide, road: Shape, right: StreetSide = null) {
        super([left, road]);
        right && right.children.length && this.addChild(right);
    }

    public get size(): Point {
        let x = 0, y = 0, z = 0;
        for (let child of this.children) {
            const dim = child.dimensions;
            z += +dim.z;
            x = Math.max(x, dim.x);
            y = Math.max(y, dim.y);
        }
        return { x, y, z };
    }

    public finalize() {
        this.positionElements()
        return super.finalize();
    }

    private positionElements() {
        let offset = 0;
        const thisSize = this.size;
        for (const object of this.children) {
            const { x, z } = object.dimensions;
            object.andTranslate((x - thisSize.x) / 2, 0, (z - thisSize.z) / 2 + offset);
            offset += z;
        }
    }
}