import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from '../../service/layout.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ProjectStructure } from '../../model/project-structure.model';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Element } from '../../model/element.model';
import * as THREE from 'three';

@Component({
    selector: 'uml-visualizer',
    templateUrl: './visualizer.component.html',
    styleUrls: ['./visualizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizerComponent implements OnInit {
    data = new BehaviorSubject<ProjectStructure[]>([]);
    versions: Observable<string[]>;
    selectedVersion = new FormControl();
    selectedLayout = new FormControl();
    selectedData: Observable<Element>;
    objects: Observable<THREE.Object3D[]>;

    constructor(private http: HttpClient, @Inject(LayoutService) private layouts: LayoutService[]) {
        this.versions = this.data.pipe(map(data => data.map(project => project.version)));
        this.selectedData = combineLatest([this.selectedVersion.valueChanges, this.data]).pipe(
            filter(([version, data]) => data.some(d => d.version === version)),
            map(([version, data]) => {
                return data.find(project => project.version === version).data;
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
        this.http.get<ProjectStructure[]>('api/model').subscribe(this.data);
    }

}
