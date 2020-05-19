import { Container } from "./container";
import { Point } from "../point";
import { Shape } from "../shape";

export class Platform extends Container {
    get size(): Point {
        return this.children[0].size;
    }

    constructor(child: Shape, public elevation: number) {
        super([child]);
    }

    addChild(child: Shape) {
        throw 'only one element';
    }

    public finalize() {
        this.positionChild();
        return super.finalize();
    }

    private positionChild() {
        const size = this.size;
        this.children[0].andTranslate(
            0, size.y / 2 + this.padding.yNeg + this.elevation, 0
        );
    }
}