import { Point } from "../point";
import { Container } from "./container";
import { Shape } from "../shape";

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

    public addChildWithOffset(child: Shape, offset: number) {
        const diff = offset - this.size.x;
        if (diff > 0) {
            this.mirrored ? child.padding.zPos += diff : child.padding.zNeg += diff;
        }
        super.addChild(child);
    }

    private positionElements() {
        let offset = 0;
        const thisSize = this.size;
        for (const object of this.children) {
            const objSize = object.size, objDimensions = object.dimensions;
            if (!this.mirrored) {
                object.andRotate(Math.PI / 2 )
                    .andTranslate((objSize.z - thisSize.x) / 2 + offset + object.padding.zNeg, 0, (thisSize.z - objSize.x) / 2);
            } else {
                object.andRotate(-Math.PI / 2)
                    .andTranslate((objSize.z - thisSize.x) / 2 + offset + object.padding.zPos, 0, (objSize.x - thisSize.z) / 2);
            }
            offset += objDimensions.z;
        }
    }
}