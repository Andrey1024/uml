import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from '../../service/layout.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, skipUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Project } from '../../model/project.model';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Element } from '../../model/element.model';
import * as THREE from 'three';
import { Select, Store } from "@ngxs/store";
import { CodeStructureState, Load, SelectSource } from "../../state/code-structure.state";
import { Hierarchy } from "../../model/hierarchy.model";

@Component({
    selector: 'uml-canvas-visualizer',
    templateUrl: './canvas-visualizer.component.html',
    styleUrls: ['./canvas-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasVisualizerComponent implements OnInit {
    @Select(CodeStructureState.getStructure)
    selectedData$: Observable<Hierarchy>;
    @Select(CodeStructureState.getSelectedSourceRoot)
    selectedSourceRoot$: Observable<string>;
    @Select(CodeStructureState.getSourceRoots)
    sourceRoots$: Observable<string>;
    @Select(CodeStructureState.isLoaded)
    isLoaded$: Observable<boolean>;

    selectedLayout = new FormControl();

    objects: Observable<THREE.Object3D[]>;

    constructor(private store: Store, @Inject(LayoutService) private layouts: LayoutService[]) {
        this.objects = combineLatest([this.selectedLayout.valueChanges, this.selectedData$]).pipe(
            skipUntil(this.isLoaded$.pipe(filter(s => s))),
            map(([layout, data]) => this.layouts.find(l => l.name === layout).place(data))
        );
    }

    get layoutTypes() {
        return this.layouts.map(l => l.name);
    }

    ngOnInit() {
        this.store.dispatch(new Load());
    }

    selectSource(source: string) {
        this.store.dispatch(new SelectSource(source));
    }

}
