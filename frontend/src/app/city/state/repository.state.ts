import { Action, createSelector, Selector, State, StateContext, Store } from '@ngxs/store';
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Project } from "../model/server-model/project";
import { Injectable } from "@angular/core";
import { Element } from "../model/server-model/element";
import { CommitsState, CommitsStateModel, Load } from "./commits.state";
import { iif, insertItem, patch, removeItem } from "@ngxs/store/operators";
import { keyBy, map, mapValues } from "lodash-es";
import { Author, Commit } from "../model/server-model/commit.model";
import { DisplayOptions } from "../service/layout.service";
import { createCachedSelector } from "../utils/cached-selector";
import { InterfaceModel } from "../model/server-model/interface.model";

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

    constructor(public path: string) {
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
    static readonly type = '[Repository] update search';

    constructor(public searchString: string) {
    }
}

export class SelectDetails {
    static readonly type = '[Repository] select details';

    constructor(public element: string) {
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
    selectedDetails: string;
}

function areListsEqual(arr1: string[], arr2: string[]) {
    return arr1.length === arr2.length && arr2.every(i => arr1.includes(i));
}

function getDiff(obj1: Element, obj2: Element): Partial<Element> {
    const oddFields = ['lifeSpan', "lifeRatio"];
    if (!obj1) {
        return obj2;
    }
    const diff = {};
    for (let key of (Object.keys(obj2))) {
        if (oddFields.includes(key)) {
            continue;
        }
        if (key === 'implementedTypes' || key === 'extendedTypes') {
            if (!areListsEqual(obj1[key], obj2[key])) {
                diff[key] = obj2[key];
            }
        }

        if (key === 'authors') {
            const authorsDiff: { [email: string]: number } = {};
            for (let author of Object.keys(obj2.authors)) {
                if (obj1.authors[author] !== obj2.authors[author]) {
                    authorsDiff[author] = obj2.authors[author];
                }
            }
            if (Object.keys(authorsDiff).length > 0) {
                diff[key] = authorsDiff;
            }
        } else if (obj2[key] !== obj1[key]) {
            diff[key] = obj2[key];
        }
    }
    return diff;
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
        search: '',
        selectedDetails: null
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
    static getSelectedElementName(state: RepositoryStateModel): string {
        return state.selectedDetails;
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


    static getElementsAtCommitIndex(commitIndex: number) {
        return createCachedSelector(
            'getElementsAtCommitIndex',
            createSelector([RepositoryState.getElements, RepositoryState.getLoadedCommitNames],
                (elements, commits) => mapValues(elements, el => el[commits[commitIndex]] || null)),
            commitIndex
        );
    }

    static getCommitElementsImmutable(commitIndex: number) {
        if (commitIndex === -1) {
            return createCachedSelector('getCommitElementsImmutable', createSelector([], () => ({})), commitIndex);
        } else if (commitIndex === 0) {
            return createCachedSelector('getCommitElementsImmutable', createSelector([this.getElementsAtCommitIndex(0)], (elements) => {
                return mapValues(elements, el => el === null ? null : ({ ...el, lifeSpan: 1, lifeRatio: 1 }))
            }), commitIndex);
        } else {
            return createCachedSelector('getCommitElementsImmutable', createSelector([
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
                            authors: changes.authors ? { ...el.authors, ...changes.authors } : el.authors,
                            lifeSpan: el.lifeSpan + 1,
                            lifeRatio: (el.lifeSpan + 1) / (commitIndex + 1)
                        };
                    }
                })
            }), commitIndex);
        }
    }

    static getSelectedElement(commitIndex: number) {
        return createSelector(
            [this.getCommitElementsImmutable(commitIndex), this.getSelectedElementName],
            (elements: { [path: string]: Element }, name) => {
                if (name === null || !elements[name]) {
                    return null;
                }
                const result: any = { ...elements[name] };
                if (result.type === 'CLASS' || result.type === 'INTERFACE') {
                    result.implementedTypes = result.implementedTypes.map(i => {
                        const ref = elements[i]
                        return {
                            name: ref ? ref.name : i,
                            hasLink: !!ref, link: ref ? ref.fullPath : null
                        }
                    });
                }
                if (result.type === 'CLASS') {
                    const ref = elements[result.superClass];
                    const child = Object.values(elements)
                        .filter(e => e !== null).find(e => e.type === "CLASS" && e.superClass === name);
                    result.superClass = {
                        name: ref ? ref.name : result.superClass,
                        hasLink: !!ref,
                        link: ref ? ref.fullPath : null
                    };
                    if (child) {
                        result.descendant = { name: child.name, link: child.fullPath };
                    }
                }
                if (result.type === 'INTERFACE') {
                    const children = Object.values(elements).filter(e => e !== null)
                        .filter(c => (c.type === 'CLASS' || c.type === 'INTERFACE') && c.implementedTypes.includes(name));
                    if (children.length) {
                        result.implementators = children.map(e => ({
                            name: e.name,
                            hasLink: true, link: e.fullPath
                        }));
                    }
                }
                return result;
            });
    }

    static getCommitsDiff(first: number, second: number) {
        return createSelector([
            this.getCommitElementsImmutable(second),
            this.getCommitElementsImmutable(first)
        ], (d1, d2) => getDiff(d1, d2));
    }

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

        return this.http.get<Project>(`/api/repository/${name}/${commit}`).pipe(
            tap(result => {
                const { loadedCommits, data } = ctx.getState();
                const current = keyBy(result.data, 'fullPath');
                const commits: CommitsStateModel = this.store.selectSnapshot(CommitsState);
                const newCommit = commits.byId[commit];
                const newIndex = loadedCommits.findIndex(c => new Date(commits.byId[c].date) > new Date(newCommit.date));
                const previous = newIndex > 0
                    ? this.store.selectSnapshot(RepositoryState.getCommitElementsImmutable(newIndex - 1)) : null;
                const next = newIndex !== -1
                    ? this.store.selectSnapshot(RepositoryState.getCommitElementsImmutable(newIndex)) : null;

                const newData = { ...data };
                for (const path of Object.keys(current)) {
                    newData[path] = data[path] ? { ...data[path] } : {};
                    newData[path][commit] = previous === null ? current[path] : getDiff(previous[path], current[path]);
                    if (next !== null && next[path]) {
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
            tap(({ data }) => {
                if (this.store.selectSnapshot(RepositoryState.getLoadedCommitNames).length === 1) {
                    const allNodes = new Set([...map(data, 'fullPath'), ...map(data, 'parentPackage')]);
                    ctx.setState(patch({
                        selectedAuthors: map(this.store.selectSnapshot(RepositoryState.getAuthorsWithCount), 'author.email'),
                        selectedNodes: [...allNodes]
                    }))
                }
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


    @Action(SelectDetails)
    selectDetails(ctx: StateContext<RepositoryStateModel>, { element }: SelectDetails) {
        ctx.patchState({ selectedDetails: element });
    }

    @Action(SetRootPath)
    setRoot(ctx: StateContext<RepositoryStateModel>, { path }: SetRootPath) {
        ctx.setState(patch({ path: iif(p => p === path, '', path) }));
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
            showAuthors: false,
            selectedDetails: null
        })
    }
}
