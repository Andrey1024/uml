import { Point } from "../point";
import { Container } from "./container";

export class StreetSide extends Container {

    constructor(public mirrored = false) {
        super([]);
    }

    public get size(): Point {
        let x = 0, y = 0, z = 0;
        for (let child of this.children) {
            const dim = child.dimensions;
            x += +dim.z;
            z = Math.max(z, dim.x);
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
        const thisDimensions = this.size;
        for (const object of this.children) {
            const { x, y, z } = object.dimensions;
            if (this.mirrored) {
                object.andRotate(Math.PI / 2 )
                    .andTranslate(-(thisDimensions.x - z) / 2 + offset, (y - thisDimensions.y) / 2, -(thisDimensions.z - x) / 2);
            } else {
                object.andRotate(-Math.PI / 2)
                    .andTranslate(-(thisDimensions.x - z) / 2 + offset, (y - thisDimensions.y) / 2, -(x - thisDimensions.z) / 2);
            }
            offset += z;
        }
    }
}