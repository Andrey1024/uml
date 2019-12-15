import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Element } from "../model/element.model";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Project } from "../model/project.model";
import { patch } from "@ngxs/store/operators";
import { Hierarchy } from "../model/hierarchy.model";
import { Node } from "../model/node.model";


export class Load {
    static readonly type = '[Code Structure] load';

    constructor(public rep: string = '') {
    }
}

export class SelectSource {
    static readonly type = '[Code Structure] select source';

    constructor(public selectedRoot: string) {
    }
}

export class SelectNodes {
    static readonly type = '[Code Structure] select nodes';

    constructor(public selectedNodes: string[]) {
    }
}

export interface CodeStructureStateModel {
    name: string;
    data: {
        [sourseRoot: string]: {
            packages: string[];
            elements: { [fullPath: string]: Element }
        };
    };
    sourceRoots: string[];
    selectedNodes: string[];
    selectedRoot: string;
    loaded: boolean;
}

function elementsSerializer(elements: Node[]) {
    return {
        packages: [...new Set(elements.map(el => el.parentPackage))],
        elements: elements.reduce((acc, el) => ({ ...acc, [el.fullPath]: el }), {})
    };
}

function packageQualifier(packageName: string) {
    return packageName.split('.').slice(0, -1).join('.');
}


@State<CodeStructureStateModel>({
    name: 'codeStructure',
    defaults: {
        name: null,
        data: {},
        sourceRoots: [],
        selectedNodes: [],
        selectedRoot: null,
        loaded: false
    }
})
export class CodeStructureState {
    @Selector()
    static isLoaded(state: CodeStructureStateModel): boolean {
        return state.loaded && !!state.selectedRoot;
    }

    @Selector()
    static getStructure(state: CodeStructureStateModel): Hierarchy {
        if (!state.selectedRoot) {
            return {};
        }
        const { elements, packages } = state.data[state.selectedRoot];
        return Object.keys(elements).reduce((h, className) => {
            let iterator = h;
            const packagePath = elements[className].parentPackage.split('.');
            for (let i = 0; i < packagePath.length; i++) {
                const curQualifier = packagePath.slice(0, i + 1).join('.');
                const curIdentifier = packagePath.slice(0, i + 2).join('.');
                if (packages.some(p => p == curQualifier || p.startsWith(curQualifier) && !(p.startsWith(curIdentifier)))) {
                    iterator[curQualifier] = iterator[curQualifier] || {};
                    iterator = iterator[curQualifier];
                }
            }
            iterator[className] = elements[className];
            return h;
        }, {});
    }

    @Selector()
    static getSourceRoots(state: CodeStructureStateModel): string[] {
        return state.sourceRoots;
    }

    @Selector()
    static getSelectedSourceRoot(state: CodeStructureStateModel): string {
        return state.selectedRoot
    }

    constructor(private http: HttpClient) {
    }

    @Action(Load)
    load(ctx: StateContext<CodeStructureStateModel>, { rep }: Load) {
        ctx.patchState({ loaded: false });
        return this.http.get<Project>('api/model').pipe(
            tap(project => ctx.setState(patch<CodeStructureStateModel>({
                name: project.name,
                sourceRoots: project.data.map(c => c.sourcePath),
                data: project.data.reduce((res, d) => ({ ...res, [d.sourcePath]: elementsSerializer(d.classes) }), {}),
                loaded: true
            })))
        )
    }

    @Action(SelectNodes)
    selectNodes(ctx: StateContext<CodeStructureStateModel>, { selectedNodes }: SelectNodes) {
        ctx.patchState({ selectedNodes });
    }

    @Action(SelectSource)
    selectSource(ctx: StateContext<CodeStructureStateModel>, { selectedRoot }: SelectSource) {
        ctx.patchState({ selectedRoot });
    }

}
