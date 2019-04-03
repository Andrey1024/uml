import {Component, OnInit} from '@angular/core';
import {SceneService} from "../../service/scene.service";
import {CityService} from "../../service/city.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/internal/Observable";
import * as d3 from "d3-hierarchy";
import {HierarchyRectangularNode} from "d3-hierarchy";
import {filter, map, tap} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {ProjectStructure} from "../../model/project-structure.model";
import {BehaviorSubject, combineLatest} from "rxjs";
import {Element} from "../../model/element.model";

@Component({
    selector: 'uml-city',
    templateUrl: './city.component.html',
    styleUrls: ['./city.component.scss'],
    providers: [{provide: SceneService, useClass: CityService}]
})
export class CityComponent implements OnInit {
    data = new BehaviorSubject<ProjectStructure[]>([]);
    versions: Observable<string[]>;
    selectedVersion = new FormControl();
    selectedData: Observable<HierarchyRectangularNode<Element>>;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        const cache = new Map<string, HierarchyRectangularNode<Element>>();
        this.http.get<ProjectStructure[]>("api/model").subscribe(this.data);
        this.versions = this.data.pipe(map(data => data.map(project => project.version)));
        this.selectedData = combineLatest(this.selectedVersion.valueChanges, this.data).pipe(
            filter(([version, data]) => data.some(d => d.version === version)),
            map(([version, data]) => {
                if (cache.has(version)) {
                    return cache.get(version);
                }
                const container = data.find(project => project.version === version).data;

                const tree = d3.hierarchy(container);
                tree.sum(d => d.children ? (d.children.length + 1) : (d.methodsCount + 1));
                const treemapLayout = d3.treemap<Element>().size([500, 500]).padding(10);
                treemapLayout.tile(d3.treemapSquarify.ratio(1));
                const result = treemapLayout(tree);

                cache.set(version, result);
                return result;
            })
        )
    }

}
