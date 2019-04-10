import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {SceneService} from "../../service/scene.service";
import {CityService} from "../../service/city.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/internal/Observable";
import * as d3 from "d3-hierarchy";
import {HierarchyRectangularNode} from "d3-hierarchy";
import {filter, map} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {ProjectStructure} from "../../model/project-structure.model";
import {BehaviorSubject, combineLatest} from "rxjs";
import {Element} from "../../model/element.model";

@Component({
    selector: 'uml-city',
    templateUrl: './city.component.html',
    styleUrls: ['./city.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: SceneService, useClass: CityService}]
})
export class CityComponent implements OnInit {
    data = new BehaviorSubject<ProjectStructure[]>([]);
    versions: Observable<string[]>;
    selectedVersion = new FormControl();
    selectedData: Observable<Element>;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        const treemapLayout = d3.treemap<Element>().size([1000, 1000])
            .round(false)
            .padding(15);
        treemapLayout.tile(d3.treemapResquarify.ratio(1));
        const cache = new Map<string, HierarchyRectangularNode<Element>>();
        this.http.get<ProjectStructure[]>("api/model").subscribe(this.data);
        this.versions = this.data.pipe(map(data => data.map(project => project.version)));
        this.selectedData = combineLatest(this.selectedVersion.valueChanges, this.data).pipe(
            filter(([version, data]) => data.some(d => d.version === version)),
            map(([version, data]) => {
                return data.find(project => project.version === version).data;
                // if (cache.has(version)) {
                //     return cache.get(version);
                // }
                // const container = data.find(project => project.version === version).data;
                //
                // const tree = d3.hierarchy(container);
                // tree.sum(d => d.children ? (d.children.length + 10) : (d.methodsCount + 10));
                // const result = treemapLayout(tree);
                // cache.set(version, result);
                // return result;
            })
        )
    }

}
