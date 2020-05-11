import { Strip } from "./shapes/strip.model";
import { Shape } from "./shapes/shape";
import { Group } from "./shapes/group";
import { Point } from "./shapes/point";

export class Grid extends Group {
    getDimensions(): Point {
        let x = 0, y = 0, z = 0;
        for (const strip of this.children) {
            const dim = strip.getDimensions();
            x = Math.max(x, dim.x);
            y = Math.max(y, dim.y);
            x = z + dim.z;
        }
        return { x, y, z };
    }

    constructor(private objects: Shape[]) {
        super([]);
    }

    public finalize() {
        this.calculateGrid();
        this.positionStrips();
        return super.finalize();
    }

    private calculateGrid() {
        this.children.push(new Strip());

        let activeStrip: number = 0;
        const bestFit: { aspectDistance: number; strip: number; } = {
            aspectDistance: Infinity,
            strip: -1
        };

        while (this.objects.length) {
            const strip = this.children[activeStrip] as Strip;
            const object = this.objects.shift();

            if (!strip.getDimensions().x || bestFit.strip === activeStrip) {
                strip.addObject(object);

                activeStrip = 0;
                bestFit.aspectDistance = Infinity;
                bestFit.strip = -1;
                continue;
            }

            const currentDimensions = this.getDimensions();
            const newLength = Math.max(strip.getDimensions().x + object.getDimensions().x, currentDimensions.x);

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
                    const widthWithNewStrip = currentDimensions.z + object.getDimensions().z;
                    const newStripAspectRatio = this.getAspectRatio(currentDimensions.x, widthWithNewStrip);
                    const newStripAspectRatioDist = Math.abs(newStripAspectRatio - 1.0);
                    gotoBestFit = newStripAspectRatioDist > bestFit.aspectDistance;
                }

                if (isLastStrip && !gotoBestFit) {
                    this.children.push(new Strip());
                }

                this.objects.unshift(object);
                activeStrip = gotoBestFit ? bestFit.strip : activeStrip + 1;

            } else {
                strip.addObject(object);

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
        const gridDimensions = this.getDimensions();
        for (const strip of this.children) {
            const stripDimensions = strip.getDimensions();
            strip.andTranslate(
                (stripDimensions.x - gridDimensions.x) / 2, 0, (stripDimensions.z - gridDimensions.z) / 2 + offset
            );
            offset += stripDimensions.z;
        }
    }
}