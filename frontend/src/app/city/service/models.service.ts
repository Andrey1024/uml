import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ProjectStructure} from "../model/project-structure.model";
import {map} from "rxjs/operators";
import * as d3 from "d3-hierarchy";

@Injectable()
export class ModelsService {
    constructor(private http: HttpClient) {
    }

    getProjejctModel(): Observable<any> {
        return this.http.get<ProjectStructure[]>("api/model").pipe(
            map(projects => projects.map(p => d3.hierarchy(p)))
        );
    }


}