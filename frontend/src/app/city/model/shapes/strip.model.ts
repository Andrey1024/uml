import { Shape } from "./shape";
import { Group } from "./group";
import { Point } from "./point";

export class Strip extends Group {

    constructor() {
        super([]);
    }

    public getDimensions(): Point {
        let x = 0, y = 0, z = 0;
        for (let child of this.children) {
            const dim = child.getDimensions();
            x += +dim.x;
            z = Math.max(z, dim.z);
            y = Math.max(y, dim.y);
        }
        return { x, y, z };
    }

    public addObject(object: Shape) {
        this.children.push(object);
    }

    public finalize() {
        this.positionElements()
        return super.finalize();
    }

    private positionElements() {
        let offset = 0;
        const stripDimensions = this.getDimensions();
        for (const object of this.children) {
            const { x, z } = object.getDimensions();
            object.andTranslate(
                (z - stripDimensions.x) / 2 + offset, 0, (x - stripDimensions.z) / 2
            );
            offset += length;
        }
    }
}