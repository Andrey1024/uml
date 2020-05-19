import { Pyramid } from "./pyramid";
import { Shape } from "../shape";
import { Column } from "./column";
import { Row } from "./row";

export class Brickwork extends Pyramid {
    private row: Column;
    private strip: Row;

    constructor(private xBlocks = 2, private zBlocks = 2) {
        super([]);
    }

    public addChild(child: Shape) {
        if (!this.strip) {
            this.strip = new Row();
            super.addChild(this.strip);
        }
        if (!this.row) {
            this.row = new Column();
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