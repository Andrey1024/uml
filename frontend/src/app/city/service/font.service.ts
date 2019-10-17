import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class FontService {
    font: THREE.Font;

    init(): Promise<THREE.Font> {
        return new Promise<THREE.Font>(resolve => {
            new THREE.FontLoader().load('assets/helvetiker_regular.typeface.json', font => {
                this.font = font;
                resolve(font);
            });
        });

    }
}
