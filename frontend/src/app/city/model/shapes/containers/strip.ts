import { Point } from "../point";
import { Container } from "./container";

export class Strip extends Container {

    constructor() {
        super([]);
    }

    public get size(): Point {
        let x = 0, y = 0, z = 0;
        for (let child of this.children) {
            const dim = child.dimensions;
            x += +dim.x;
            z = Math.max(z, dim.z);
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
        const stripDimensions = this.size;
        for (const object of this.children) {
            const padding = object.padding, size = object.size, dimensions = object.dimensions;
            object.andTranslate(
                (size.x - stripDimensions.x) / 2 + padding.xNeg + offset,
                (size.y - stripDimensions.y) / 2 + padding.yNeg,
                (size.z - stripDimensions.z) / 2 + padding.zNeg
            );
            offset += dimensions.x;
        }
    }
}