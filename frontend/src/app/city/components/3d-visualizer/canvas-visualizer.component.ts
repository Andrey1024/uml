import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from '../../service/layout.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Project } from '../../model/project.model';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Element } from '../../model/element.model';
import * as THREE from 'three';

@Component({
    selector: 'uml-canvas-visualizer',
    templateUrl: './canvas-visualizer.component.html',
    styleUrls: ['./canvas-visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasVisualizerComponent implements OnInit {
    data = new BehaviorSubject<Project>(null);
    versions: Observable<string[]>;
    selectedVersion = new FormControl();
    selectedLayout = new FormControl();
    selectedData: Observable<Element>;
    objects: Observable<THREE.Object3D[]>;

    constructor(private http: HttpClient, @Inject(LayoutService) private layouts: LayoutService[]) {
        this.versions = this.data.pipe(
            map(data => data ? data.data.map(d => d.name) : [])
        );
        this.selectedData = combineLatest([this.selectedVersion.valueChanges, this.data]).pipe(
            filter(([version, data]) => !!data),
            map(([version, data]) => {
                return data.data.find(project => project.name === version);
            })
        );
        this.objects = combineLatest([this.selectedLayout.valueChanges, this.selectedData]).pipe(
            map(([layout, data]) => this.layouts.find(l => l.name === layout).place(data))
        );
    }

    get layoutTypes() {
        return this.layouts.map(l => l.name);
    }

    ngOnInit() {
        this.http.get<Project>('api/model').subscribe(this.data);
    }

}
