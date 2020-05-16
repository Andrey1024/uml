import { Shape } from "../shape";
import { StreetSide } from "./street-side";
import { Point } from "../point";
import { Row } from "./row";

export class Street extends Row {
    private leftSide = new StreetSide(false);
    private rightSide = new StreetSide(true);
    public road: Shape;

    get length() {
        return Math.max(this.leftSide.dimensions.x, this.rightSide.dimensions.x);
    }

    get size(): Point {
        const leftSize = this.leftSide.dimensions, road = this.road ? this.road.dimensions : { x: 0, y: 0, z: 0 },
            rightSize = this.rightSide.dimensions;
        return {
            x: Math.max(leftSize.x, road.x, rightSize.x),
            y: Math.max(leftSize.y, road.y, rightSize.y),
            z: leftSize.z + road.z + rightSize.z
        };
    }

    constructor(private objects: Shape[]) {
        super();

        // objects.sort((a, b) => b.getTranslation().y - a.getTranslation().y);
        this.calculateSides();
    }

    public finalize() {
        this.addChild(this.leftSide);
        this.addChild(this.road);
        this.rightSide.children.length && this.addChild(this.rightSide);
        return super.finalize();
    }

    public addRoad(road: Shape) {
        this.road = road;
    }

    private calculateSides() {

        while (this.objects.length) {
            const object = this.objects.pop();
            if (this.leftSide.dimensions.x <= this.rightSide.dimensions.x) {
                this.leftSide.addChild(object);
            } else {
                this.rightSide.addChild(object);
            }
        }

    }

}