import { Strip } from "./strip";
import { Shape } from "../shape";
import { Point } from "../point";
import { Container } from "./container";

export class Grid extends Container {
    get size(): Point {
        let x = 0, y = 0, z = 0;
        for (const strip of this.children) {
            const dim = strip.dimensions;
            x = Math.max(x, dim.x);
            y = Math.max(y, dim.y);
            z = z + dim.z;
        }
        return { x, y, z };
    }

    constructor(private objects: Shape[]) {
        super([]);
        objects.sort((a, b) => {
            const dimA = a.dimensions, dimB = b.dimensions;
            if (dimA.x < dimB.x) {
                return 1;
            } else if (dimA.x > dimB.x) {
                return -1;
            } else if (dimA.z < dimB.z) {
                return 1;
            } else if (dimA.z > dimB.z) {
                return -1;
            } else {
                return 1;
            }
        });
        this.calculateGrid();
    }

    public finalize() {
        this.positionStrips();
        return super.finalize();
    }

    private calculateGrid() {
        this.addChild(new Strip());

        let activeStrip: number = 0;
        const bestFit: { aspectDistance: number; strip: number; } = {
            aspectDistance: Infinity,
            strip: -1
        };

        while (this.objects.length) {
            const strip = this.children[activeStrip] as Strip;
            const object = this.objects.shift();

            if (!strip.dimensions.x || bestFit.strip === activeStrip) {
                strip.addChild(object);

                activeStrip = 0;
                bestFit.aspectDistance = Infinity;
                bestFit.strip = -1;
                continue;
            }

            const currentDimensions = this.dimensions;
            const newLength = Math.max(strip.dimensions.x + object.dimensions.x, currentDimensions.z);

            const possibleAspectRatio = this.getAspectRatio(newLength, currentDimensions.z);
            const possibleAspectRatioDist = Math.abs(possibleAspectRatio - 1.0);

            const currentAspectRatio = this.getAspectRatio(currentDimensions.x, currentDimensions.z);
            const currentAspectRatioDist = Math.abs(currentAspectRatio - 1.0);

            const aspectRatioImpaired = possibleAspectRatioDist > currentAspectRatioDist;

            if (aspectRatioImpaired) {
                if (possibleAspectRatioDist < bestFit.aspectDistance) {
                    bestFit.aspectDistance = possibleAspectRatioDist;
                    bestFit.strip = activeStrip;
                }

                const isLastStrip = activeStrip + 1 === this.children.length;
                let gotoBestFit = false;
                if (isLastStrip) {
                    const widthWithNewStrip = currentDimensions.z + object.dimensions.z;
                    const newStripAspectRatio = this.getAspectRatio(currentDimensions.x, widthWithNewStrip);
                    const newStripAspectRatioDist = Math.abs(newStripAspectRatio - 1.0);
                    gotoBestFit = newStripAspectRatioDist > bestFit.aspectDistance;
                }

                if (isLastStrip && !gotoBestFit) {
                    this.addChild(new Strip());
                }

                this.objects.unshift(object);
                activeStrip = gotoBestFit ? bestFit.strip : activeStrip + 1;

            } else {
                strip.addChild(object);

                activeStrip = 0;
                bestFit.aspectDistance = Infinity;
                bestFit.strip = -1;
            }
        }
    }

    private getAspectRatio(length: number, width: number): number {
        return Math.max(length, width) / Math.min(length, width);
    }

    private positionStrips() {
        let offset = 0;
        const gridDimensions = this.dimensions;
        for (const strip of this.children) {
            const stripDimensions = strip.dimensions;
            strip.andTranslate(
                (stripDimensions.x - gridDimensions.x) / 2,
                (stripDimensions.y - gridDimensions.y) / 2,
                (stripDimensions.z - gridDimensions.z) / 2 + offset
            );
            offset += stripDimensions.z;
        }
    }
}