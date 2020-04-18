import * as THREE from 'three';
import { Strip } from "./strip.model";

export class Grid {
    private grid = new THREE.Group();
    private strips: Strip[] = [];

    get dimensions(): THREE.Vector3 {
        const vector = new THREE.Vector3();
        for (const strip of this.strips) {
            vector.setX(Math.max(vector.x, strip.dimensions.x));
            vector.setY(Math.max(vector.y, strip.dimensions.y));
            vector.setZ(vector.z + strip.dimensions.z);
        }
        return vector;
    }

    constructor(private objects: THREE.Object3D[]) {
        this.grid.matrixAutoUpdate = false;
        this.grid.matrixWorldNeedsUpdate = true;
    }

    public finalize(): THREE.Object3D {
        this.calculateGrid();
        this.positionStrips();
        return this.grid;
    }

    private calculateGrid() {
        this.strips.push(new Strip());

        let activeStrip: number = 0;
        const bestFit: { aspectDistance: number; strip: number; } = {
            aspectDistance: Infinity,
            strip: -1
        };

        while (this.objects.length) {
            const strip = this.strips[activeStrip];
            const object = this.objects.shift();

            if (!strip.dimensions.x || bestFit.strip === activeStrip) {
                strip.addObject(object);

                activeStrip = 0;
                bestFit.aspectDistance = Infinity;
                bestFit.strip = -1;
                continue;
            }

            const currentDimensions = this.dimensions;
            const newLength = Math.max(strip.dimensions.x + object.userData.length, currentDimensions.x);

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

                const isLastStrip = activeStrip + 1 === this.strips.length;
                let gotoBestFit = false;
                if (isLastStrip) {
                    const widthWithNewStrip = currentDimensions.z + object.userData.width;
                    const newStripAspectRatio = this.getAspectRatio(currentDimensions.x, widthWithNewStrip);
                    const newStripAspectRatioDist = Math.abs(newStripAspectRatio - 1.0);
                    gotoBestFit = newStripAspectRatioDist > bestFit.aspectDistance;
                }

                if (isLastStrip && !gotoBestFit) {
                    this.strips.push(new Strip());
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
        const gridDimensions = this.dimensions;
        for (const strip of this.strips) {
            const object = strip.finalize(), stripDimensions = strip.dimensions;
            object.applyMatrix(new THREE.Matrix4().makeTranslation(
                (stripDimensions.x - gridDimensions.x) / 2, 0, (stripDimensions.z - gridDimensions.z) / 2 + offset)
            )
            offset += stripDimensions.z;
            this.grid.add(object);
        }
    }
}