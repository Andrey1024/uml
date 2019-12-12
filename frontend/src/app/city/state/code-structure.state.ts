import { Action, State, StateContext } from '@ngxs/store';
import { Element } from "../model/element.model";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Project } from "../model/project.model";
import { patch } from "@ngxs/store/operators";


export class Load {
    static readonly type = '[Code Structure] load';

    constructor(public rep: string) {
    }
}

export class SelectNodes {
    static readonly type = '[Code Structure] select nodes';

    constructor(public selectedNodes: string[]) {
    }
}

export interface CodeStructureStateModel {
    name: string;
    elements: { [path: string]: Element };
    sourceRoots: string[];
    selectedNodes: string[];
}

function elementsSerializer(db: { [path: string]: Element }, el: Element) {
    db[el.fullPath] = el;
    if (el.type === 'PACKAGE') {
        return el.children.reduce(elementsSerializer, db);
    }
    return db;
}

@State<CodeStructureStateModel>({
    name: 'codeStructure',
    defaults: {
        name: null,
        elements: {},
        sourceRoots: [],
        selectedNodes: []
    }
})
export class CodeStructureState {

    constructor(private http: HttpClient) {
    }

    @Action(Load)
    load(ctx: StateContext<CodeStructureStateModel>, { rep }: Load) {
        return this.http.get<Project>('api/model').pipe(
            tap(proj => ctx.setState(patch<CodeStructureStateModel>({
                name: proj.name,
                sourceRoots: proj.data.map(c => c.name),
                elements: proj.data.reduce(elementsSerializer, {})
            })))
        )
    }

    @Action(SelectNodes)
    selectNodes(ctx: StateContext<CodeStructureStateModel>, { selectedNodes }: SelectNodes) {
        ctx.patchState({ selectedNodes });
    }
}
