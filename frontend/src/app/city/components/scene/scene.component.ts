import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    NgZone,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { SceneService } from '../../service/scene.service';
import { Element } from '../../model/element.model';
import * as THREE from 'three';

@Component({
    selector: 'uml-scene',
    templateUrl: './scene.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, OnChanges, AfterViewInit {
    @ViewChild('canvas', { static: true }) canvasContainer: ElementRef<HTMLDivElement>;
    objects: THREE.Object3D[] = [];

    constructor(private sceneService: SceneService, private ngZone: NgZone) {
    }

    @Input() set hierarchy(data: Element) {
        this.objects = data ? this.sceneService.show(data) : [];
    }

    ngOnInit() {
    }

    ngAfterViewInit() {

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hierarchy && this.hierarchy) {
            this.ngZone.runOutsideAngular(() => {
                setTimeout(() => this.sceneService.show(this.hierarchy));
            });
        }
    }
}
