import { Element, MemberElement, TypeElement } from "../model/presentation/server/element";
import { Action, createSelector, Selector, State, StateContext, Store } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Cached } from "../utils/cached-selector";
import { keyBy, mapValues } from "lodash-es";
import { VersionedElement } from "../model/versioning/versioned-element.model";
import { applyChanges, getDiff } from "../model/presentation/patchers/model-patcher";
import { Commit } from "../model/presentation/server/commit.model";
import { append, iif, insertItem, patch } from "@ngxs/store/operators";
import { of } from "rxjs";
import { tap } from "rxjs/operators";
import { ById } from "../model/by-id";

const TYPES = ['CLASS', 'INTERFACE', 'ENUM'];
const MEMBERS = ['METHOD'];

export interface VersionsStateModel {
    data: {
        [qualifiedName: string]: {
            [commit: string]: Partial<Element>;
        }
    },
    changes: {
        [filePath: string]: { [commit: string]: boolean };
    }
    commits: {
        [commit: string]: Commit
    }
    changesRange: { from: string, to: string },
    versions: string[];
}

export class AddCommitData {
    static readonly type = '[Versions] add commit data';

    constructor(public commit: string, public elements: Element[]) {
    }
}

export class AddChangesData {
    static readonly type = '[Versions] add changes data';

    constructor(public changes: ById<string[]>) {
    }
}

export class AddCommits {
    static readonly type = '[Versions] add commits';

    constructor(public commits: Commit[]) {
    }
}


@State<VersionsStateModel>({
    name: 'versions',
    defaults: {
        data: {},
        commits: {},
        changes: null,
        changesRange: null,
        versions: []
    }
})
@Injectable()
export class VersionsState {
    @Selector([VersionsState])
    private static getData(state: VersionsStateModel) {
        return state.data;
    }


    @Selector([VersionsState])
    private static getCommits(state: VersionsStateModel): ById<Commit> {
        return state.commits;
    }

    @Selector([VersionsState.getCommits])
    static getCommitsAsc(commits: { [commit: string]: Commit }) {
        return Object.values(commits).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    @Selector([VersionsState.getCommits])
    static getCommitsDesc(commits: { [commit: string]: Commit }) {
        return Object.values(commits).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    }

    @Selector([VersionsState])
    static getVersions(state: VersionsStateModel): string[] {
        return state.versions;
    }

    @Selector([VersionsState])
    static getChanges(state: VersionsStateModel): ById<ById<boolean>> {
        return state.changes;
    }

    @Selector([VersionsState.getVersions, VersionsState.getCommits])
    static getVersionCommits(versions: string[], commits: { [commit: string]: Commit }): Commit[] {
        return versions.map(v => commits[v]);
    }

    @Selector([VersionsState.getCommits])
    static getAuthors(commits: ById<Commit>): string[] {
        return [...new Set(Object.values(commits).map(c => c.author.email))];
    }

    @Cached('commitChanges')
    static getChangesAtCommit(index: number, range = 1): (...args: any[]) => ById<Partial<Element>> {
        return createSelector([this.getData, this.getVersions],
            (data: { [p: string]: { [p: string]: Partial<Element> } }, versions: string[]) =>
                Object.keys(data).reduce((result, name) => {
                    for (let i = range; i > 0; i--) {
                        if (!!data[name][versions[index - i + 1]]) {
                            result[name] = { ...(result[name] || {}), ...data[name][versions[index - i + 1]] };
                        }
                    }
                    return result;
                }, <{ [name: string]: Partial<Element> }> {})
        )
    }

    @Selector([VersionsState.getChanges, VersionsState.getVersions, VersionsState.getCommitsAsc])
    static getAuthorsOfChanges(changes: ById<ById<boolean>>, versions: string[], commits: Commit[]) {
        if (changes === null || versions.length < 2) return null;
        const start = commits.findIndex(c => c.name === versions[0]);
        const end = commits.findIndex(c => c.name === versions[versions.length - 1]);
        let result: ById<string[]> = {};
        for (let i = start; i < end; i++) {
            const { email } = commits[i].author;
            for (const file of Object.keys(changes).filter(p => changes[p][commits[i].name])) {
                result[file] = result[file] || [];
                result[file].push(email);
            }
        }
        return result;
    }

    @Cached('commitData')
    static getDataAtCommit(index: number, compareTo: number = null): (...args: any[]) => { [name: string]: VersionedElement<Element> } {
        if (index < 0) {
            return createSelector([], () => ({}));
        }
        if (index === 0) {
            return createSelector([this.getChangesAtCommit(0)], initial => mapValues(initial, element => ({
                isFirstEncounter: true, lifeRatio: 1, lifeSpan: 1, data: element
            })));
        }
        return createSelector([
                this.getDataAtCommit(compareTo === null ? index - 1 : compareTo),
                this.getChangesAtCommit(index, compareTo === null ? 1 : index - compareTo)
            ],
            (previous: ById<VersionedElement<Element>>, changes: ById<Partial<Element>>) => {
                const existed = new Set(Object.keys(previous));
                let result: { [name: string]: VersionedElement<Element> } = {};
                for (let name of new Set([...Object.keys(previous), ...Object.keys(changes)])) {
                    const lifeSpan = existed.has(name) ? previous[name].lifeSpan + 1 : 1;
                    if (changes[name]) {
                        result[name] = {
                            isFirstEncounter: !existed.has(name),
                            data: existed.has(name) ? applyChanges(previous[name].data, changes[name]) : <Element> changes[name],
                            lifeSpan, lifeRatio: lifeSpan / (index + 1)
                        };
                    } else {
                        result[name] = {
                            isFirstEncounter: false,
                            data: previous[name].data,
                            lifeRatio: lifeSpan / (index + 1),
                            lifeSpan
                        }
                    }
                    if (compareTo !== null) {
                        result[name].changes = changes[name];
                    }
                }
                return result;
            })
    }

    @Cached('typesData')
    static getTypesDataAtCommit(index: number, compareTo: number = null): (...args: any[]) => { [name: string]: VersionedElement<TypeElement> } {
        return createSelector(
            [this.getDataAtCommit(index, compareTo), this.getAuthorsOfChanges],
            (data: ById<VersionedElement<any>>, authors: ById<string[]>) => {
                const result: { [name: string]: VersionedElement<TypeElement> } = {};
                for (const path of Object.keys(data)) {
                    if (TYPES.includes(data[path].data.type)) {
                        result[path] = { ...data[path] };
                        if (compareTo !== null) {
                            result[path].authors = authors === null ? [] : authors[result[path].data.filePath];
                        }
                    }
                }
                return result;
            })
    }

    @Cached('membersData')
    static getMembersDataAtCommit(index: number, compareTo: number = null): (...args: any[]) => { [name: string]: VersionedElement<MemberElement> } {
        return createSelector([this.getDataAtCommit(index, compareTo)], (data: { [name: string]: VersionedElement<Element> }) => {
            const result = {};
            for (const path of Object.keys(data)) {
                if (MEMBERS.includes(data[path].data.type)) {
                    result[path] = data[path];
                }
            }
            return result;
        })
    }


    constructor(private store: Store) {
    }

    @Action(AddCommitData)
    addCommitData(ctx: StateContext<VersionsStateModel>, { commit, elements }: AddCommitData) {
        return of({}).pipe(tap(() => {
            const { versions, data, commits } = ctx.getState();
            const commitInfo = commits[commit];
            const versionsInfo = versions.map(v => commits[v]);
            const newIndex = versionsInfo.findIndex(c => new Date(c.date) > new Date(commitInfo.date));
            const previous = newIndex > 0
                ? this.store.selectSnapshot(VersionsState.getDataAtCommit(newIndex - 1)) : null;
            const next = newIndex !== -1
                ? this.store.selectSnapshot(VersionsState.getDataAtCommit(newIndex)) : null;
            const newData = { ...data };
            for (const element of elements) {
                const path = element.fullPath;
                newData[path] = data[path] ? { ...data[path] } : {};
                const change = previous === null ? element : getDiff(previous[path] ? previous[path].data : null, element);
                if (change !== null) {
                    newData[path][commit] = change;
                }
                if (next !== null && next[path]) {
                    newData[path][versionsInfo[newIndex].name] = getDiff(element, next[path].data);
                }
            }
            ctx.setState(patch({
                data: newData,
                versions: iif(newIndex !== -1, insertItem(commit, newIndex), append([commit]))
            }))
        }));
    }

    @Action(AddChangesData)
    addChangesData(ctx: StateContext<VersionsStateModel>, { changes }: AddChangesData) {
        ctx.setState(patch({
            changes: mapValues(changes, a => a.reduce((acc, c) => ({ ...acc, [c]: true }), {}))
        }));
    }

    @Action(AddCommits)
    addCommits(ctx: StateContext<VersionsStateModel>, { commits }: AddCommits) {
        ctx.setState(patch({ commits: s => ({ ...s, ...keyBy(commits, 'name') }) }));
    }
}