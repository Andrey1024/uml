import { Action, createSelector, Selector, State, StateContext, Store } from '@ngxs/store';
import { HttpClient } from "@angular/common/http";
import { finalize, tap } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { Element } from "../model/presentation/server/element";
import { iif, insertItem, patch, removeItem } from "@ngxs/store/operators";
import { keyBy, map, mapValues } from "lodash-es";
import { Author, Commit } from "../model/presentation/server/commit.model";
import { InterfaceModel } from "../model/presentation/server/interface.model";
import { DataManageSelectors } from "./data-manage.selectors";
import { AddCommitData, AddCommits, VersionsState } from "./versions.state";
import { VersionedElement } from "../model/versioning/versioned-element.model";
import { Cached } from "../utils/cached-selector";
import { ProjectModel } from "../model/presentation/server/project.model";

export class OpenRepository {
    static readonly type = '[Repository] open';

    constructor(public name: string) {
    }
}

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
    repository: string;
    sourceRoot: string;
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
    for (const key in obj2) {
        if (key === 'implementedTypes' || key === 'extendedTypes') {
            if (!areListsEqual(obj1[key], obj2[key])) {
                diff[key] = obj2[key];
            }
        }

        if (obj2[key] !== obj1[key]) {
            diff[key] = obj2[key];
        }
    }
    return diff;
}

@State<RepositoryStateModel>({
    name: 'repository',
    defaults: {
        repository: null,
        sourceRoot: "",
        path: "",
        commit: null,
        highLight: null,
        search: '',
        selectedDetails: null
    }
})
@Injectable()
export class RepositoryState {
    @Selector([RepositoryState])
    static getSelectedElementName(state: RepositoryStateModel): string {
        return state.selectedDetails;
    }

    @Selector([RepositoryState])
    static getRootPath(state: RepositoryStateModel) {
        return state.path;
    }

    @Selector([RepositoryState])
    static getSelectedCommit(state: RepositoryStateModel) {
        return state.commit;
    }


    @Selector([RepositoryState])
    static getSourceRoot(state: RepositoryStateModel) {
        return state.sourceRoot;
    }

    // static getSelectedElement(commitIndex: number) {
    //     return createSelector(
    //         [VersionsState.getDataAtCommit(commitIndex), this.getSelectedElementName],
    //         (elements: { [path: string]: VersionedElement<Element> }, name) => {
    //             if (name === null || !elements[name]) {
    //                 return null;
    //             }
    //             const result: any = { ...elements[name] };
    //             if (result.type === 'CLASS' || result.type === 'INTERFACE') {
    //                 result.implementedTypes = result.implementedTypes.map(i => {
    //                     const ref = elements[i]
    //                     return {
    //                         name: ref ? ref.name : i,
    //                         hasLink: !!ref, link: ref ? ref.fullPath : null
    //                     }
    //                 });
    //             }
    //             if (result.type === 'CLASS') {
    //                 const ref = elements[result.superClass];
    //                 const child = Object.values(elements)
    //                     .filter(e => e !== null).find(e => e.type === "CLASS" && e.superClass === name);
    //                 result.superClass = {
    //                     name: ref ? ref.name : result.superClass,
    //                     hasLink: !!ref,
    //                     link: ref ? ref.fullPath : null
    //                 };
    //                 if (child) {
    //                     result.descendant = { name: child.name, link: child.fullPath };
    //                 }
    //             }
    //             if (result.type === 'INTERFACE') {
    //                 const children = Object.values(elements).filter(e => e !== null)
    //                     .filter(c => (c.type === 'CLASS' || c.type === 'INTERFACE') && c.implementedTypes.includes(name));
    //                 if (children.length) {
    //                     result.implementators = children.map(e => ({
    //                         name: e.name,
    //                         hasLink: true, link: e.fullPath
    //                     }));
    //                 }
    //             }
    //             return result;
    //         });
    // }
    //
    // @Selector([RepositoryState.getSelectedCommit, CommitsState.getAllCommits, CommitsState.getAuthorsByEmail])
    // static getAuthorsWithCount(commit: string, commits: Commit[], authorsByEmail): { author: Author, count: number }[] {
    //     if (commit === null) return [];
    //     const authors = new Map<string, number>();
    //     let i = 0
    //     do {
    //         const author = commits[i].author.email;
    //         authors.set(author, authors.has(author) ? authors.get(author) + 1 : 1);
    //     } while (commits[i++].name !== commit);
    //     return [...authors.keys()].map(author => ({ author: authorsByEmail[author], count: authors.get(author) }))
    //         .sort((a, b) => b.count - a.count);
    // }

    @Cached('sourceRoots')
    static getSourceRoots(commitIndex: number) {
        createSelector([VersionsState.getDataAtCommit(commitIndex)], (elements) => {
            const roots = new Set<string>();
            Object.keys(elements).forEach(path => elements[path] && roots.add(elements[path].data.sourceRoot));
            return [...roots];
        });
    }

    @Selector([RepositoryState])
    static getSearch(state: RepositoryStateModel) {
        return state.search;
    }

    //
    // @Selector([RepositoryState])
    // static getCommitIndex(state: RepositoryStateModel) {
    //     return state.loadedCommits.indexOf(state.commit);
    // }


    @Selector([RepositoryState])
    static getHighLight(state: RepositoryStateModel) {
        return state.highLight;
    }


    constructor(private http: HttpClient) {
    }

    @Action(OpenRepository)
    openRepository(ctx: StateContext<RepositoryStateModel>, {name}: OpenRepository) {
        ctx.patchState({repository: name});
        return this.http.get<Commit[]>(`/api/repository/${name}`).pipe(
            tap(commits => ctx.dispatch(new AddCommits(commits)))
        );
    }


    @Action(LoadState)
    loadState(ctx: StateContext<RepositoryStateModel>, { commit }: LoadState) {
        const { repository } = ctx.getState();
        return this.http.get<ProjectModel>(`/api/repository/${repository}/${commit}`).pipe(
            tap(result => ctx.dispatch(new AddCommitData(commit, result.data)))
            // tap(({ data }) => {
            //     if (this.store.selectSnapshot(RepositoryState.getLoadedCommitNames).length === 1) {
            //         const allNodes = new Set([...map(data, 'fullPath'), ...map(data, 'parentPackage')]);
            //         const sourceRoots = this.store.selectSnapshot(RepositoryState.getSourceRoots(0));
            //         ctx.setState(patch({
            //             selectedAuthors: map(this.store.selectSnapshot(RepositoryState.getAuthorsWithCount), 'author.email'),
            //             selectedNodes: [...allNodes],
            //             sourceRoot: sourceRoots[0]
            //         }))
            //     }
            // })
        );
    }


    @Action(SelectCommit)
    selectCommit(ctx: StateContext<RepositoryStateModel>, { commit }: SelectCommit) {
        setTimeout(() => ctx.patchState({ commit }));
    }

    @Action(SelectSourceRoot)
    selectSourceRoot(ctx: StateContext<RepositoryStateModel>, { sourceRoot }: SelectSourceRoot) {
        ctx.patchState({ sourceRoot });
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

}
