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
import { Visualizer } from "../../services/visualizer";

@Component({
    selector: 'uml-canvas-visualizer',
    templateUrl: './canvas-visualizer.component.html',
    styleUrls: ['./canvas-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasVisualizerComponent implements OnChanges, OnInit, AfterViewInit {
    @ViewChild(ThreeDirective, { static: false }) three: ThreeDirective;

    @Input() tree: ItemNode[];
    @Input() layoutName: string;
    @Input() selectedElement: string;
    @Input() displayOptions;

    @Output() select = new EventEmitter<string>();

    helper: IllustratorHelper;

    data: THREE.Group;
    drawingMesh: THREE.Object3D;
    selectedMesh: THREE.Object3D;
    highLightMesh: THREE.Object3D;

    pickingMesh: THREE.Object3D;

    constructor(@Inject(Visualizer) private layouts: Visualizer[]) {

    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes.tree || changes.displayOptions || changes.layoutName) && this.tree.length) {
            const visualizer = this.layouts.find(l => l.name === this.layoutName);
            this.helper = visualizer.visualize(this.tree, this.displayOptions);
            this.data = new THREE.Group()
            this.drawingMesh = this.helper.getTreeMesh();
            this.pickingMesh = this.helper.getPickingMesh();
            this.data.add(this.drawingMesh);
            // this.data = this.layouts.find(layout => layout.name === this.layoutName)
            //     .place(this.hierarchy, this.displayOptions);
        }
        if (changes.selectedElement) {
            if (this.selectedMesh) {
                this.data.remove(this.selectedMesh);
                this.selectedMesh = null;
            }
            if (this.selectedElement) {
                this.selectedMesh = this.helper.createHighLightMesh(this.selectedElement, 'green');
                this.data.add(this.selectedMesh);
            }
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
