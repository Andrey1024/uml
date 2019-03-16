import { Component, OnInit } from '@angular/core';
import { SceneService } from "../../service/scene.service";
import { CityService } from "../../service/city.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { HierarchyRectangularNode } from "d3-hierarchy";
import * as d3 from "d3-hierarchy";
import { map } from "rxjs/operators";

@Component({
    selector: 'uml-city',
    templateUrl: './city.component.html',
    styleUrls: ['./city.component.scss'],
    providers: [{ provide: SceneService, useClass: CityService }]
})
export class CityComponent implements OnInit {
    data: Observable<HierarchyRectangularNode<any>>;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.data = this.http.get<any>("api/model").pipe(
            map(result => {
                const tree = d3.hierarchy(result);
                tree.count();
                const treemap = d3.treemap<any>().size([500, 500]).padding(10);
                return treemap(tree).sum(d => d.value);
            })
        );
    }

}
