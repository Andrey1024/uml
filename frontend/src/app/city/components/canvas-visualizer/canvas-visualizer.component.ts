import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component, EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit, Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import * as THREE from 'three';
import { ItemNode } from "../../model/tree-item.model";
import { ThreeDirective } from '../../directives/three.directive';
import { DistrictVisualizer } from "../../model/visualizers/district-visualizer";
import { IllustratorHelper } from "../../model/illustrators/illustrator";
import { StreetsVisualizer } from "../../model/visualizers/streets-visualizer";
import { Visualizer, VisualizerOptions } from "../../services/visualizer";
import { keyBy } from "lodash-es";

@Component({
    selector: 'uml-canvas-visualizer',
    templateUrl: './canvas-visualizer.component.html',
    styleUrls: ['./canvas-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasVisualizerComponent implements OnChanges, OnInit, AfterViewInit {
    private readonly visualizers: { [name: string]: Visualizer };
    @ViewChild(ThreeDirective, { static: false }) three: ThreeDirective;

    @Input() tree: ItemNode[];
    @Input() method: string;
    @Input() selectedElement: string;
    @Input() options: VisualizerOptions;

    @Output() hover = new EventEmitter<string>();
    @Output() select = new EventEmitter<string>();

    helper: IllustratorHelper;

    data: THREE.Group;
    drawingMesh: THREE.Object3D;
    selectedMesh: THREE.Object3D;
    highLightMesh: THREE.Object3D;

    pickingMesh: THREE.Object3D;

    constructor(@Inject(Visualizer) visualizers: Visualizer[]) {
        this.visualizers = keyBy(visualizers, 'name');
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes.tree || changes.options || changes.method) && this.tree.length) {
            this.helper = this.visualizers[this.method].visualize(this.tree, this.options);
            this.data = new THREE.Group()
            this.drawingMesh = this.helper.getTreeMesh();
            this.pickingMesh = this.helper.getPickingMesh();
            this.data.add(this.drawingMesh);
        }
        if (this.selectedMesh) {
            this.data.remove(this.selectedMesh);
            this.selectedMesh = null;
        }
        if (this.selectedElement) {
            this.selectedMesh = this.helper.createHighLightMesh(this.selectedElement, 'green');
            this.data.add(this.selectedMesh);
        }
    }

    addHighLight(id: number) {
        if (this.highLightMesh) {
            this.data.remove(this.highLightMesh);
            this.highLightMesh = null;
        }
        if (id !== 0) {
            this.highLightMesh = this.helper.createHighLightMesh(this.helper.getNameByIndex(id), 'tomato');
            this.data.add(this.highLightMesh);
        }
        this.hover.emit(id === 0 ? null : this.helper.getNameByIndex(id));
    }


    ngAfterViewInit() {
        this.three.resize()
    }

    selectElement(id: number) {
        this.select.emit(this.helper.getNameByIndex(id));
    }

    public focusOnElement(el: string) {
        this.three.focus(el);
    }
}
