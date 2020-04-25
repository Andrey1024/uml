import { Action, createSelector, Select, Selector, State, StateContext, StateOperator, Store } from '@ngxs/store';
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Hierarchy } from "../model/hierarchy.model";
import { SourceRoot } from "../model/server-model/source-root.model";
import { Injectable } from "@angular/core";
import { ItemNode } from "../model/tree-item.model";
import { Element } from "../model/server-model/element";
import { CommitsState, CommitsStateModel } from "./commits.state";
import { compose, insertItem, patch } from "@ngxs/store/operators";
import { element } from "protractor";
import { PatchSpec } from "@ngxs/store/operators/patch";

export class LoadState {
    static readonly type = '[Repository] load commit state';

    constructor(public commit: string) {
    }
}

export class SelectCommit {
    static readonly type = '[Repository] select commit';

    constructor(public commit: string) {
    }
}

export class SelectNodes {
    static readonly type = '[Repository] select nodes';

    constructor(public selectedNodes: string[]) {
    }
}

export class SelectSourceRoot {
    static readonly type = '[Repository] select source root';

    constructor(public sourceRoot: string) {
    }
}

export class SetRootPath {
    static readonly type = '[Repository] set root';

    constructor(public rootPath: string) {
    }
}

export class Focus {
    static readonly type = '[Repository] focus';

    constructor(public name: string) {
    }

}

export interface RepositoryStateModel {
    name: string;
    data: { [commit: string]: { [fullPath: string]: Element[] } };
    loadedCommits: string[];
    path: string;
    selectedNodes: string[];
    commit: string;
    highLight: string;
}

function getHierarchy(data, path: string): Hierarchy {
    let el = data[path];
    if (el === undefined) {
        return null;
    }

    return el.type === 'CONTAINER'
        ? el.children.reduce((acc, cur) => {
            let child = data[cur];
            let name = cur;
            while (child.type === 'CONTAINER' && child.children.length === 1) {
                child = data[child.children[0]];
                name = child.fullPath;
            }
            return { ...acc, [name]: getHierarchy(data, name) }
        }, {})
        : el;
}

function buildItemTree(data, path: string): ItemNode[] {
    let el = data[path];
    if (el === undefined) {
        return null;
    }


    return el.type === 'CONTAINER'
        ? el.children
            .map(childPath => {
                let child = data[childPath];
                let name = child.name;
                while (child.type === 'CONTAINER' && child.children.length === 1) {
                    child = data[child.children[0]];
                    name = name ? `${name}.${child.name}` : child.name;
                }

                return new ItemNode(child.fullPath, name, buildItemTree(data, child.fullPath));
            })
        : null;
}

function enhancedPatch<T>(patchObject: PatchSpec<T>): StateOperator<T> {
    return (state: Readonly<T>) => state ? patch(patchObject)(state) : patch(patchObject)(<any> {});
}


@State<RepositoryStateModel>({
    name: 'codeStructure',
    defaults: {
        name: null,
        data: {},
        loadedCommits: [],
        path: '_root_',
        selectedNodes: [],
        commit: null,
        highLight: null
    },
    children: [CommitsState]
})
@Injectable()
export class RepositoryState {
    @Selector([RepositoryState])
    static getElements(state: RepositoryStateModel) {
        return state.data;
    }


    @Selector([RepositoryState])
    static getRootPath(state: RepositoryStateModel) {
        return state.path;
    }

    @Selector([RepositoryState])
    static getSelectedNodes(state: RepositoryStateModel) {
        return new Set(state.selectedNodes);
    }

    @Selector([RepositoryState])
    static getSelectedCommit(state: RepositoryStateModel) {
        return state.commit;
    }

    @Selector([RepositoryState, CommitsState])
    static getLoadedCommits(repository: RepositoryStateModel, commits: CommitsStateModel) {
        return repository.loadedCommits.map(name => commits.byId[name]).sort((a, b) => +a.date - +b.date);
    }

    @Selector([RepositoryState.getElements, RepositoryState.getRootPath, RepositoryState.getSelectedCommit])
    static getHierarchy(data, path, commit) {
        if (data === null || commit === null) return null;
        return getHierarchy(data[commit], path);
    }

    @Selector([RepositoryState.getElements, RepositoryState.getRootPath, RepositoryState.getSelectedCommit])
    static getTreeItems(data, path, commit) {
        if (data === null || commit === null) return null;
        return buildItemTree(data[commit], path);
    }

    @Selector([RepositoryState])
    static getHighLight(state: RepositoryStateModel) {
        return state.highLight;
    }

    constructor(private http: HttpClient, private store: Store) {
    }

    @Action(LoadState)
    loadState(ctx: StateContext<RepositoryStateModel>, { commit }: LoadState) {
        const name = this.store.selectSnapshot(CommitsState.getRepositoryName);
        return this.http.get<SourceRoot>(`/api/repository/${name}/${commit}`).pipe(
            // tap(results => results.data.forEach(data => ctx.setState(patch({
            //     data: patch({ [data.fullPath]: enhancedPatch({ [results.commit]: data }) })
            // }))))
            tap(result => ctx.setState(patch({
                data: patch({
                    [commit]: result.data.reduce((acc, cur) => {
                        acc[cur.fullPath || '_root_'] = cur;
                        return acc;
                    }, {})
                })
            }))),
            tap(result => ctx.setState(patch({
                selectedNodes: result.data.map(i => i.fullPath),
                loadedCommits: insertItem(commit)
            })))
        );
    }


    @Action(SelectNodes)
    selectNodes(ctx: StateContext<RepositoryStateModel>, { selectedNodes }: SelectNodes) {
        ctx.patchState({ selectedNodes });
    }

    @Action(SelectCommit)
    selectCommit(ctx: StateContext<RepositoryStateModel>, { commit }: SelectCommit) {
        ctx.patchState({ commit });
    }

    @Action(SelectSourceRoot)
    selectSourceRoot(ctx: StateContext<RepositoryStateModel>, { sourceRoot }: SelectSourceRoot) {
        // ctx.patchState({ sourceRoot, byPath: });
    }

    @Action(SetRootPath)
    setRoot(ctx: StateContext<RepositoryStateModel>, { rootPath }: SetRootPath) {
        // ctx.patchState({ rootPath });
    }

    @Action(Focus)
    focusObject(ctx: StateContext<RepositoryStateModel>, { name }: Focus) {
        if (ctx.getState().highLight !== name) {
            ctx.patchState({ highLight: name });
        }
    }
}
