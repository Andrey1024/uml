import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { LayoutService } from '../../service/layout.service';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, skipUntil, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import * as THREE from 'three';
import { Select, Store } from "@ngxs/store";
import {
    CodeStructureState,
    LoadReverse,
    rootPath,
    SelectNodes,
    SetRoot,
    SetVersion
} from "../../state/code-structure.state";
import { Hierarchy } from "../../model/hierarchy.model";
import { ItemNode } from "../../model/tree-item.model";

@Component({
    selector: 'uml-canvas-visualizer',
    templateUrl: './canvas-visualizer.component.html',
    styleUrls: ['./canvas-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasVisualizerComponent implements OnInit {
    @Select(CodeStructureState.getHierarchy)
    selectedData$: Observable<Hierarchy>;

    @Select(CodeStructureState.getVersion)
    selectedVersion$: Observable<number>;

    @Select(CodeStructureState.getVersions)
    versions$: Observable<string>;

    @Select(CodeStructureState.isLoaded)
    isLoaded$: Observable<boolean>;

    @Select(CodeStructureState.getTreeItems)
    treeItems$: Observable<ItemNode[]>;

    @Select(CodeStructureState.getSelectedNodes)
    selectedNodes$: Observable<Set<string>>;

    @Select(CodeStructureState.getRootPath)
    rootPath$: Observable<string>;

    selectedLayout = new FormControl();

    objects: Observable<THREE.Object3D[]>;


    constructor(private store: Store, @Inject(LayoutService) private layouts: LayoutService[]) {
        this.selectedLayout.setValue(layouts[0].name);
        this.objects = combineLatest([
            this.selectedLayout.valueChanges.pipe(startWith(this.selectedLayout.value)),
            this.selectedData$
        ]).pipe(
            skipUntil(this.isLoaded$.pipe(filter(s => s))),
            filter(([layout, data]) => data !== null),
            map(([layout, data]) => this.layouts.find(l => l.name === layout).place(data))
        );
    }

    get layoutTypes() {
        return this.layouts.map(l => l.name);
    }

    ngOnInit() {
        this.store.dispatch(new LoadReverse());
    }

    selectVersion(version: number) {
        this.store.dispatch(new SetVersion(version));
    }

    versionThumb(versions: string) {
        return i => versions[i];
    }

    selectNodes(nodes: string[]) {
        this.store.dispatch(new SelectNodes(nodes));
    }

    setRoot(path: string = rootPath) {
        this.store.dispatch(new SetRoot(path));
    }
}
