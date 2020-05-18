import { Action, createSelector, Selector, State, StateContext, Store } from '@ngxs/store';
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { MemberElement, TypeElement } from "../model/presentation/server/element";
import { iif, patch } from "@ngxs/store/operators";
import { Author, Commit } from "../model/presentation/server/commit.model";
import { AddChangesData, AddCommitData, AddCommits, VersionsState } from "./versions.state";
import { VersionedElement } from "../model/versioning/versioned-element.model";
import { Cached } from "../utils/cached-selector";
import { ProjectModel } from "../model/presentation/server/project.model";
import { createTree } from "../model/presentation/patchers/create-tree";
import { ItemNode } from "../model/tree-item.model";
import { ClassConnections } from "../model/presentation/class-connections";
import { InterfaceConnections } from "../model/presentation/interface-connections";
import { EnumModel } from "../model/presentation/server/enum.model";
import { ElementConnections } from "../model/presentation/element-connections";
import { ById } from "../model/by-id";
import { mapValues } from "lodash-es";

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

export class LoadChanges {
    static readonly type = '[Repository] loadChanges';

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

export class SelectCompareTo {
    static readonly type = '[Repository] select compare version';

    constructor(public compareStart: string) {
    }
}


export interface RepositoryStateModel {
    repository: string;
    search: string;
    selectedSourceRoot: string;
    selectedPath: string;
    selectedVersion: string;
    selectedElement: string;
    compareStart: string;
    loadingCount: number;
}

@State<RepositoryStateModel>({
    name: 'repository',
    defaults: {
        repository: null,
        selectedSourceRoot: '',
        selectedPath: '',
        selectedVersion: null,
        search: '',
        selectedElement: null,
        compareStart: null,
        loadingCount: 0
    }
})
@Injectable()
export class RepositoryState {
    @Selector([RepositoryState])
    static getSelectedElementName(state: RepositoryStateModel): string {
        return state.selectedElement;
    }

    @Selector([RepositoryState])
    static getRepository(state: RepositoryStateModel): string {
        return state.repository;
    }

    @Selector([RepositoryState])
    static getLoadingCount(state: RepositoryStateModel): number {
        return state.loadingCount;
    }

    @Selector([RepositoryState])
    static getSelectedSourceRoot(state: RepositoryStateModel): string {
        return state.selectedSourceRoot;
    }


    @Selector([RepositoryState])
    static getSelectedPath(state: RepositoryStateModel): string {
        return state.selectedPath;
    }


    @Selector([RepositoryState])
    static getSelectedVersion(state: RepositoryStateModel): string {
        return state.selectedVersion;
    }

    @Selector([RepositoryState])
    static getVersionCompareTo(state: RepositoryStateModel): string {
        return state.compareStart;
    }


    @Selector([RepositoryState.getVersionCompareTo, VersionsState.getVersions])
    static getCompareToIndex(version: string, versions: string[]): number {
        return version === null ? null : versions.indexOf(version);
    }


    @Selector([RepositoryState.getSelectedVersion, VersionsState.getVersions])
    static getSelectedVersionIndex(version: string, versions: string[]): number {
        return versions.indexOf(version)
    }

    @Cached('sourceRoots')
    static getSourceRoots(commitIndex: number): (...args: any[]) => string[] {
        return createSelector([VersionsState.getTypesDataAtCommit(commitIndex)], (elements: { [name: string]: VersionedElement<TypeElement> }) => {
            const roots = new Set<string>(Object.values(elements).map(e => e.data.sourceRoot));
            return [...roots];
        });
    }

    @Cached('elementList')
    static getElementList(commitIndex: number): (...args: any[]) => ById<string> {
        return createSelector([VersionsState.getTypesDataAtCommit(commitIndex)], (elements: { [name: string]: VersionedElement<TypeElement> }) => {
            return mapValues(elements, e => e.data.name);
        });
    }

    @Selector([RepositoryState])
    static getSearch(state: RepositoryStateModel): string {
        return state.search;
    }

    @Selector([RepositoryState.getSelectedVersion, RepositoryState.getVersionCompareTo, VersionsState.getCommitsAsc])
    static getAuthorsWithCount(to: string, from: string, commits: Commit[]): { author: Author, count: number }[] {
        if (from === null) return [];
        const start = commits.findIndex(c => c.name === from);
        const end = commits.findIndex(c => c.name === to);
        const authors = new Map<string, number>();
        const authorsMap = new Map<string, Author>();

        for (let i = start; i < end; i++) {
            const author = commits[i].author;
            authorsMap.set(author.email, author);
            authors.set(author.email, authors.has(author.email) ? authors.get(author.email) + 1 : 1);
        }
        return [...authors.keys()].map(author => ({ author: authorsMap.get(author), count: authors.get(author) }))
            .sort((a, b) => b.count - a.count);
    }

    @Cached('elementDetails')
    static getElementDetails(commitIndex: number): (...args: any[]) => ElementConnections {
        return createSelector(
            [this.getSelectedElementName, VersionsState.getTypesDataAtCommit(commitIndex)],
            (name: string, data: { [name: string]: VersionedElement<TypeElement> }): ClassConnections | InterfaceConnections | EnumModel => {
                if (!name) {
                    return null;
                }
                const result: ClassConnections | InterfaceConnections | EnumModel = { ...data[name].data };

                if (result.type === 'CLASS') {
                    const descendant = Object.values(data)
                        .find(({ data }) => data.type === 'CLASS' && data.superClass === name);
                    if (descendant !== undefined) {
                        result.descendant = descendant.data.fullPath;
                    }
                }
                if (result.type === 'INTERFACE') {
                    const implementers = Object.values(data)
                        .filter(({ data }) => (data.type === 'CLASS' || data.type === 'INTERFACE') && data.implementedTypes.includes(name));
                    if (implementers.length) {
                        result.implementers = implementers.map(e => e.data.fullPath);
                    }
                }
                return result;
            })
    }

    @Cached('selectedTree')
    static getSelectedTree(commitIndex: number, compareTo: number = null): (...args: any[]) => ItemNode[] {
        return createSelector([
                VersionsState.getTypesDataAtCommit(commitIndex, compareTo),
                VersionsState.getMembersDataAtCommit(commitIndex, compareTo),
                this.getSelectedSourceRoot,
                this.getSelectedPath
            ], (data: { [name: string]: VersionedElement<TypeElement> },
                members: { [name: string]: VersionedElement<MemberElement> },
                sourceRoot: string, path: string) =>
                createTree(Object.values(data)
                        .filter(e => e !== null)
                        .filter(e => e.data.sourceRoot === sourceRoot)
                        .filter(e => e.data.fullPath.startsWith(path)),
                    Object.values(members)
                )
        )
    }

    @Cached('versionsToCompare')
    static getVersionsToCompare(commitIndex: number): (...args: any[]) => Commit[] {
        return createSelector(
            [VersionsState.getVersionCommits],
            (versions: Commit[]) => versions.slice(0, commitIndex)
        );
    }

    constructor(private http: HttpClient, private store: Store) {
    }

    @Action(OpenRepository)
    openRepository(ctx: StateContext<RepositoryStateModel>, { name }: OpenRepository) {
        ctx.patchState({ repository: name });
        return this.http.get<Commit[]>(`/api/repository/${name}`).pipe(
            tap(commits => ctx.dispatch(new AddCommits(commits))),
            tap(commits => ctx.dispatch(new LoadState(commits[0].name)))
        );
    }


    @Action(LoadState)
    loadState(ctx: StateContext<RepositoryStateModel>, { commit }: LoadState) {
        const { repository } = ctx.getState();
        ctx.setState(patch({ loadingCount: i => i + 1 }));
        return this.http.get<ProjectModel>(`/api/repository/${repository}/${commit}`).pipe(
            tap(result => ctx.dispatch(new AddCommitData(commit, result.data))),
            tap(() => ctx.getState().selectedVersion === null && ctx.dispatch(new SelectCommit(commit))),
            tap(() => ctx.setState(patch({ loadingCount: i => i - 1 })), () => ctx.setState(patch({ loadingCount: i => i - 1 })))
        );
    }

    @Action(LoadChanges)
    loadChanges(ctx: StateContext<RepositoryStateModel>) {
        const versions = this.store.selectSnapshot(VersionsState.getVersions);
        const { repository } = ctx.getState();
        return this.http.get<ById<string[]>>(`/api/repository/${repository}/${versions[0]}/${versions[versions.length - 1]}`).pipe(
            tap(result => ctx.dispatch(new AddChangesData(result)))
        );
    }

    @Action(SelectCommit)
    selectCommit(ctx: StateContext<RepositoryStateModel>, { commit }: SelectCommit) {
        const versions = this.store.selectSnapshot(VersionsState.getVersions);
        const index = versions.indexOf(commit);

        const sourceRoots = this.store.selectSnapshot(RepositoryState.getSourceRoots(index));
        ctx.setState(patch({
            selectedVersion: commit,
            selectedSourceRoot: iif(root => sourceRoots.includes(root), r => r, sourceRoots[0]),
            compareStart: iif(c => c !== null && versions.indexOf(c) < index, c => c, null)
        }));
        if (ctx.getState().compareStart !== null) {
            ctx.dispatch(new LoadChanges());
        }
    }

    @Action(SelectSourceRoot)
    selectSourceRoot(ctx: StateContext<RepositoryStateModel>, { sourceRoot }: SelectSourceRoot) {
        ctx.patchState({ selectedSourceRoot: sourceRoot });
    }


    @Action(UpdateSearch)
    updateSearch(ctx: StateContext<RepositoryStateModel>, { searchString }: UpdateSearch) {
        ctx.patchState({ search: searchString });
    }


    @Action(SelectDetails)
    selectDetails(ctx: StateContext<RepositoryStateModel>, { element }: SelectDetails) {
        ctx.patchState({ selectedElement: element });
    }

    @Action(SetRootPath)
    selectPath(ctx: StateContext<RepositoryStateModel>, { path }: SetRootPath) {
        ctx.setState(patch({ selectedPath: iif(p => p === path, '', path) }));
    }

    @Action(SelectCompareTo)
    selectCompareVersion(ctx: StateContext<RepositoryStateModel>, { compareStart }: SelectCompareTo) {
        ctx.setState(patch({ compareStart }));
        if (compareStart !== null) {
            return ctx.dispatch(new LoadChanges());
        }
    }
}
