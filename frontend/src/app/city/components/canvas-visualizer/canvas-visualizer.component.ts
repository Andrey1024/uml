import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Inject,
    Input,
    OnChanges,
    OnInit,
    ViewChild
} from '@angular/core';
import { LayoutService } from '../../service/layout.service';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import * as THREE from 'three';
import { Actions, Select, Store } from "@ngxs/store";
import { Focus, RepositoryState, SelectNodes } from "../../state/repository.state";
import { Hierarchy } from "../../model/hierarchy.model";
import { ItemNode } from "../../model/tree-item.model";
import { ThreeDirective } from '../../directives/three.directive';

@Component({
    selector: 'uml-canvas-visualizer',
    templateUrl: './canvas-visualizer.component.html',
    styleUrls: ['./canvas-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasVisualizerComponent implements OnChanges, OnInit, AfterViewInit {
    @ViewChild(ThreeDirective, { static: false }) three: ThreeDirective;

    @Input() hierarchy: Hierarchy;
    @Input() selected: Set<string>;
    @Input() layoutName: string;

    data: THREE.Object3D[];

    constructor(@Inject(LayoutService) private layouts: LayoutService[]) {

    }

    ngOnInit() {
    }

    ngOnChanges(): void {
        this.data = this.layouts.find(layout => layout.name === this.layoutName).place(this.hierarchy);
    }

    ngAfterViewInit() {
        // this.three.
    }
}
