import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Hierarchy } from "../model/hierarchy.model";
import { SourceRoot } from "../model/server-model/source-root.model";
import { Injectable } from "@angular/core";
import { ItemNode } from "../model/tree-item.model";
import { Element } from "../model/server-model/element";
import { CommitsState, CommitsStateModel, Load } from "./commits.state";
import { insertItem, patch } from "@ngxs/store/operators";
import { keyBy, mapValues, set } from "lodash-es";
import { Commit } from "../model/server-model/commit.model";

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

export class SelectAuthors {
    static readonly type = '[Repository] select authors';

    constructor(public authors: string[]) {
    }
}

export class Focus {
    static readonly type = '[Repository] focus';

    constructor(public name: string) {
    }

}

export interface RepositoryStateModel {
    data: { [path: string]: { [commit: string]: Element } };
    loadedCommits: string[];
    sourceRoot: string;
    selectedNodes: string[];
    selectedAuthors: string[];
    path: string;
    commit: string;
    highLight: string;
}

function collapse(hierarchy): Hierarchy {
    return Object.keys(hierarchy).reduce((result, path) => {
        let child = hierarchy[path];
        let name = path;
        let children = Object.keys(child);
        while (children.length === 1 && !child[children[0]].type) {
            name = `${name}.${children[0]}`;
            child = child[children[0]];
            children = Object.keys(child);
        }
        result[name] = child;
        return result
    }, {})
}

function createHierarchy(elements: Element[]): Hierarchy {
    let packageMap: Hierarchy = {};
    for (const element of elements) {
        set(packageMap, element.fullPath, element);
    }

    return collapse(packageMap);
}

function createTree(hierarchy: any, pack: string = null): ItemNode[] {
    return Object.keys(hierarchy).map(path => hierarchy[path].type
        ? new ItemNode(hierarchy[path].fullPath, hierarchy[path].name, null)
        : new ItemNode(pack ? `${pack}.${path}` : path, path, createTree(hierarchy[path], pack ? `${pack}.${path}` : path)))
}

@State<RepositoryStateModel>({
    name: 'repository',
    defaults: {
        data: {},
        loadedCommits: [],
        sourceRoot: "",
        path: "",
        selectedNodes: [],
        selectedAuthors: [],
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
    static getSelectedAuthors(state: RepositoryStateModel): string[] {
        return state.selectedAuthors;
    }

    @Selector([RepositoryState])
    static getSelectedCommit(state: RepositoryStateModel) {
        return state.commit;
    }

    @Selector([RepositoryState])
    static getLoadedCommitNames(state: RepositoryStateModel): string[] {
        return state.loadedCommits;
    }

    @Selector([RepositoryState])
    static getSourceRoot(state: RepositoryStateModel) {
        return state.sourceRoot;
    }

    @Selector([RepositoryState.getLoadedCommitNames, CommitsState])
    static getLoadedCommits(loaded: string[], commits: CommitsStateModel) {
        return loaded.map(name => commits.byId[name]).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    @Selector([RepositoryState.getElements, RepositoryState.getSelectedCommit, RepositoryState.getLoadedCommits, RepositoryState.getSelectedAuthors])
    static getCommitElements(data, commit, commits, authors: string[]): Element[] {
        if (commit == null) return [];
        const commitsBefore = [];
        let i = 0;
        do {
            commitsBefore.push(commits[i])
        } while (commits[i++].name !== commit);
        return Object.keys(data).filter(key => !!data[key][commit]).map(path => ({
            ...data[path][commit],
            lifeSpan: commitsBefore.filter(c => !!data[path][c]).length / commitsBefore.length,
            authors: mapValues(data[path][commit], (val, key) => authors.includes(key) ? val : 0)
        }));
    }

    @Selector([RepositoryState.getCommitElements])
    static getSourceRoots(elements: Element[]): string[] {
        const roots = new Set<string>();
        elements.forEach(el => roots.add(el.sourceRoot));
        return [...roots];
    }

    @Selector([RepositoryState.getCommitElements, RepositoryState.getRootPath, RepositoryState.getSourceRoot])
    static getFilteredElements(elements: Element[], path: string, sourceRoot: string): Element[] {
        return elements
            .filter(element => element.fullPath.startsWith(path))
            .filter(element => sourceRoot === '' ? true : element.sourceRoot === sourceRoot);
    }


    @Selector([RepositoryState.getSelectedCommit, CommitsState.getAllCommits])
    static getAuthorsWithCount(commit: string, commits: Commit[]): { author: string, count: number }[] {
        if (commit === null) return [];
        const authors = new Map<string, number>();
        let i = 0
        do {
            const author = commits[i].author.name;
            authors.set(author, authors.has(author) ? authors.get(author) + 1 : 1);
        } while (commits[i++].name !== commit);
        return [...authors.keys()].map(author => ({ author, count: authors.get(author) }))
            .sort((a, b) => b.count - a.count);
    }

    @Selector([RepositoryState.getFilteredElements])
    static getHierarchy(elements: Element[]) {
        return createHierarchy(elements);
    }

    @Selector([RepositoryState.getHierarchy])
    static getTreeItems(hierarchy) {
        return createTree(hierarchy);
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
            tap(result => {
                const { data } = ctx.getState();
                const newData = result.data.reduce((acc, cur) => {
                    acc[cur.fullPath] = { ...data[cur.fullPath], [commit]: cur };
                    return acc;
                }, {})
                ctx.setState(patch({
                    data: newData,
                    loadedCommits: insertItem(commit)
                }));
            })
        );
    }

    @Action(SelectNodes)
    selectNodes(ctx: StateContext<RepositoryStateModel>, { selectedNodes }: SelectNodes) {
        ctx.setState(patch({ selectedNodes }));
    }

    @Action(SelectCommit)
    selectCommit(ctx: StateContext<RepositoryStateModel>, { commit }: SelectCommit) {
        ctx.patchState({ commit });
    }

    @Action(SelectSourceRoot)
    selectSourceRoot(ctx: StateContext<RepositoryStateModel>, { sourceRoot }: SelectSourceRoot) {
        ctx.patchState({ sourceRoot });
    }

    @Action(SelectAuthors)
    selectAuthors(ctx: StateContext<RepositoryStateModel>, { authors }: SelectAuthors) {
        ctx.patchState({ selectedAuthors: authors });
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


    @Action(Load)
    resetState(ctx: StateContext<RepositoryStateModel>) {
        ctx.patchState({
            data: {},
            loadedCommits: [],
            sourceRoot: "",
            path: "",
            selectedNodes: [],
            selectedAuthors: [],
            commit: null,
            highLight: null
        })
    }
}
