import { Action, createSelector, Selector, State, StateContext, Store } from '@ngxs/store';
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Hierarchy } from "../model/hierarchy.model";
import { CommitState } from "../model/server-model/commit-state.model";
import { Injectable } from "@angular/core";
import { ItemNode } from "../model/tree-item.model";
import { Element } from "../model/server-model/element";
import { CommitsState, CommitsStateModel, Load } from "./commits.state";
import { insertItem, patch, removeItem } from "@ngxs/store/operators";
import { keyBy, mapValues, set } from "lodash-es";
import { Author, Commit } from "../model/server-model/commit.model";
import { DisplayOptions } from "../service/layout.service";
import { DataManageSelectors } from "./data-manage.selectors";

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

export class AuthorView {
    static readonly type = '[Repository] authors view';

    constructor(public showAuthors: boolean) {
    }
}

export class UpdateSearch {
    static readonly type = '[Repository] updateSearch';

    constructor(public searchString: string) {
    }
}

export interface RepositoryStateModel {
    data: { [path: string]: { [commit: string]: Partial<Element> } };
    loadedCommits: string[];
    loadingCommits: string[];
    sourceRoot: string;
    selectedNodes: string[];
    selectedAuthors: string[];
    showAuthors: boolean;
    search: string;
    path: string;
    commit: string;
    highLight: string;
}

function getDiff(obj1: Element, obj2: Element): Partial<Element> {
    return Object.keys(obj2).reduce((newVal, key) => {
        if (obj2[key] !== obj1[key]) {
            newVal[key] = obj2[key];
        }
        return newVal;
    }, {});
}

@State<RepositoryStateModel>({
    name: 'repository',
    defaults: {
        data: {},
        loadedCommits: [],
        loadingCommits: [],
        sourceRoot: "",
        path: "",
        selectedNodes: [],
        selectedAuthors: [],
        commit: null,
        highLight: null,
        showAuthors: false,
        search: ''
    },
    children: [CommitsState]
})
@Injectable()
export class RepositoryState {
    @Selector([RepositoryState])
    static areAuthorsShowed(state: RepositoryStateModel): boolean {
        return state.showAuthors;
    }

    @Selector([RepositoryState])
    static getElements(state: RepositoryStateModel) {
        return state.data;
    }

    @Selector([RepositoryState])
    static getRootPath(state: RepositoryStateModel) {
        return state.path;
    }

    @Selector([RepositoryState])
    static getSelectedNodes(state: RepositoryStateModel): string[] {
        return state.selectedNodes;
    }

    @Selector([RepositoryState])
    static getSelectedAuthors(state: RepositoryStateModel): string[] {
        return state.selectedAuthors;
    }

    @Selector([RepositoryState.areAuthorsShowed, RepositoryState.getSelectedAuthors])
    static getDisplayOptions(showAuthors: boolean, selectedAuthors: string[]): DisplayOptions {
        return { showAuthors, selectedAuthors };
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
    static getLoadingCommitNames(state: RepositoryStateModel): string[] {
        return state.loadingCommits;
    }

    @Selector([RepositoryState])
    static getSourceRoot(state: RepositoryStateModel) {
        return state.sourceRoot;
    }


    @Selector([RepositoryState.getLoadedCommitNames, CommitsState])
    static getLoadedCommits(loaded: string[], commits: CommitsStateModel) {
        return loaded.map(name => commits.byId[name]);
    }

    @Selector([RepositoryState.getLoadingCommitNames, CommitsState])
    static getLoadingCommits(loaded: string[], commits: CommitsStateModel) {
        return loaded.map(name => commits.byId[name]).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }


    private static getElementsAtCommitIndexHash = new Map<number, any>();

    static getElementsAtCommitIndex(index: number) {
        if (!this.getElementsAtCommitIndexHash.has(index)) {
            this.getElementsAtCommitIndexHash.set(index, createSelector(
                [RepositoryState.getElements, RepositoryState.getLoadedCommitNames],
                (elements, commits) => mapValues(elements, el => el[commits[index]] || null)));
        }
        return this.getElementsAtCommitIndexHash.get(index);
    }

    private static getCommitElementsImmutableHash = new Map<number, any>();

    static getCommitElementsImmutable(commitIndex: number) {
        if (!this.getCommitElementsImmutableHash.has(commitIndex)) {
            if (commitIndex === -1) {
                this.getCommitElementsImmutableHash.set(commitIndex, createSelector([], () => ({})));
            } else if (commitIndex === 0) {
                this.getCommitElementsImmutableHash.set(commitIndex, createSelector([this.getElementsAtCommitIndex(0)], (elements) => {
                    return mapValues(elements, el => el === null ? null : ({ ...el, lifeSpan: 1, lifeRatio: 1 }))
                }));
            } else {
                this.getCommitElementsImmutableHash.set(commitIndex, createSelector([
                    this.getCommitElementsImmutable(commitIndex - 1),
                    this.getElementsAtCommitIndex(commitIndex)], (previous, changes) => {
                    return mapValues(previous, (el, path) => {
                        if (changes[path] === null) {
                            return null;
                        }
                        if (el === null) {
                            return { ...changes[path], lifeSpan: 1, lifeRatio: 1 / (commitIndex + 1) };
                        } else {
                            return {
                                ...el, ...changes[path],
                                lifeSpan: el.lifeSpan + 1,
                                lifeRatio: (el.lifeSpan + 1) / (commitIndex + 1)
                            };
                        }
                    })
                }));
            }
        }
        return this.getCommitElementsImmutableHash.get(commitIndex);
    }


    // @Selector([RepositoryState.getElements, RepositoryState.getSelectedCommit, RepositoryState.getLoadedCommits, RepositoryState.getSelectedAuthors])
    // static getCommitElements(data, commit, commits, authorEmails: string[]): Element[] {
    //     if (commit == null) return [];
    //     const commitsBefore = [];
    //     let i = 0;
    //     do {
    //         commitsBefore.push(commits[i])
    //     } while (commits[i++].name !== commit);
    //     return Object.keys(data).filter(key => !!data[key][commit]).map(path => {
    //         const lifeSpan = commitsBefore.filter(c => !!data[path][c.name]).length / commitsBefore.length;
    //         const authors = mapValues(data[path][commit].authors, (val, key) => authorEmails.includes(key) ? val : 0);
    //         return ({
    //             ...data[path][commit],
    //             lifeSpan,
    //             authors
    //         })
    //     });
    // }

    // @Selector([RepositoryState.getCommitElements])
    // static getSourceRoots(elements: Element[]): string[] {
    //     const roots = new Set<string>();
    //     elements.forEach(el => roots.add(el.sourceRoot));
    //     return [...roots];
    // }


    //
    //
    // @Selector([RepositoryState.getCommitElements, RepositoryState.getRootPath, RepositoryState.getSourceRoot])
    // static getFilteredElements(elements: Element[], path: string, sourceRoot: string): Element[] {
    //     return elements
    //         .filter(element => element.fullPath.startsWith(path))
    //         .filter(element => sourceRoot === '' ? true : element.sourceRoot === sourceRoot);
    // }


    @Selector([RepositoryState.getSelectedCommit, CommitsState.getAllCommits, CommitsState.getAuthorsByEmail])
    static getAuthorsWithCount(commit: string, commits: Commit[], authorsByEmail): { author: Author, count: number }[] {
        if (commit === null) return [];
        const authors = new Map<string, number>();
        let i = 0
        do {
            const author = commits[i].author.email;
            authors.set(author, authors.has(author) ? authors.get(author) + 1 : 1);
        } while (commits[i++].name !== commit);
        return [...authors.keys()].map(author => ({ author: authorsByEmail[author], count: authors.get(author) }))
            .sort((a, b) => b.count - a.count);
    }

    @Selector([RepositoryState])
    static getSearch(state: RepositoryStateModel) {
        return state.search;
    }

    @Selector([RepositoryState])
    static getCommitIndex(state: RepositoryStateModel) {
        return state.loadedCommits.indexOf(state.commit);
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
        ctx.setState(patch({ loadingCommits: insertItem(commit) }));

        return this.http.get<CommitState>(`/api/repository/${name}/${commit}`).pipe(
            tap(result => {
                const { loadedCommits, data } = ctx.getState();
                const current = keyBy(result.data, 'fullPath');
                const commits: CommitsStateModel = this.store.selectSnapshot(CommitsState);
                const newCommit = commits.byId[commit];
                const newIndex = loadedCommits.findIndex(c => new Date(commits.byId[c].date) > new Date(newCommit.date));
                const previous = newIndex > 0
                    ? this.store.selectSnapshot(RepositoryState.getCommitElementsImmutable(newIndex - 1)) : {};
                const next = newIndex !== -1
                    ? this.store.selectSnapshot(RepositoryState.getCommitElementsImmutable(newIndex)) : null;

                const newData = { ...data };
                for (const path of Object.keys(current)) {
                    newData[path] = data[path] || {};
                    newData[path] = { ...newData[path], [commit]: getDiff(previous[path] || {}, current[path]) };
                    if (newIndex !== -1) {
                        newData[path][loadedCommits[newIndex]] = getDiff(current[path], next[path] || {});
                    }
                }
                ctx.setState(patch({
                    data: newData,
                    loadedCommits: insertItem(commit, newIndex >= 0 ? newIndex : loadedCommits.length),
                    loadingCommits: removeItem(c => c === commit),
                    commit: c => c === null ? commit : c
                }))
            }),
            tap(result => {
                // if (this.store.selectSnapshot(RepositoryState.getLoadedCommitNames).length === 1) {
                //     const elements = this.store.selectSnapshot(RepositoryState.getFilteredElements);
                //     const allNodes = new Set([...map(elements, 'fullPath'), ...map(elements, 'parentPackage')]);
                //     ctx.setState(patch({
                //         selectedAuthors: map(this.store.selectSnapshot(RepositoryState.getAuthorsWithCount), 'author.email'),
                //         selectedNodes: [...allNodes]
                //     }))
                // }
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


    @Action(AuthorView)
    authorsView(ctx: StateContext<RepositoryStateModel>, { showAuthors }: AuthorView) {
        ctx.patchState({ showAuthors });
    }

    @Action(SelectAuthors)
    selectAuthors(ctx: StateContext<RepositoryStateModel>, { authors }: SelectAuthors) {
        ctx.patchState({ selectedAuthors: authors });
    }


    @Action(UpdateSearch)
    updateSearch(ctx: StateContext<RepositoryStateModel>, { searchString }: UpdateSearch) {
        ctx.patchState({ search: searchString });
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
            highLight: null,
            loadingCommits: [],
            showAuthors: false
        })
    }
}
