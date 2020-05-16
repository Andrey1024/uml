import { Pyramid } from "./pyramid";
import { Shape } from "../shape";
import { Row } from "./row";
import { Strip } from "./strip";

export class Brickwork extends Pyramid {
    private row: Row;
    private strip: Strip;

    constructor(private xBlocks = 2, private zBlocks = 2) {
        super([]);
    }

    finalize() {
        return super.finalize();
    }

    public addChild(child: Shape) {
        if (!this.strip) {
            this.strip = new Strip();
            super.addChild(this.strip);
        }
        if (!this.row) {
            this.row = new Row();
            this.strip.addChild(this.row);
        }
        this.row.addChild(child);
        if (this.row.children.length === this.zBlocks) {
            this.row = null;
            if (this.strip.children.length === this.xBlocks) {
                this.strip = null;
            }
        }
    }
}