import { Element } from "../model/presentation/server/element";
import { Action, createSelector, Selector, State, StateContext, Store } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Cached } from "../utils/cached-selector";
import { keyBy, mapValues } from "lodash-es";
import { VersionedElement } from "../model/versioning/versioned-element.model";
import { applyChanges, getDiff } from "../model/presentation/patchers/model-patcher";
import { Commit } from "../model/presentation/server/commit.model";
import { insertItem, patch } from "@ngxs/store/operators";
import { of } from "rxjs";
import { tap } from "rxjs/operators";


export interface VersionsStateModel {
    data: {
        [qualifiedName: string]: {
            [commit: string]: Partial<Element>;
        }
    },
    commits: {
        [commit: string]: Commit
    }
    versions: string[];
}

export class AddCommitData {
    static readonly type = '[Versions] add commit data';

    constructor(public commit: string, public elements: Element[]) {
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
        versions: []
    }
})
@Injectable()
export class VersionsState {
    @Selector([VersionsState])
    private static getVersionsData(state: VersionsStateModel) {
        return state.data;
    }

    @Selector([VersionsState])
    private static getCommits(state: VersionsStateModel) {
        return state.commits;
    }

    @Cached('commitChanges')
    static getChangesAtCommit(index: number): (...args: any[]) => { [name: string]: Partial<Element> } {
        return createSelector([this.getVersionsData, this.getCommits],
            (data: { [p: string]: { [p: string]: Partial<Element> } }, commits: Commit[]) =>
                Object.keys(data).reduce((result, name) => {
                    if (!!data[name][commits[index].name]) {
                        result[name] = data[name][commits[index].name];
                    }
                    return result;
                }, <{ [name: string]: Partial<Element> }> {})
        )
    }

    @Cached('commitData')
    static getDataAtCommit(index: number): (...args: any[]) => { [name: string]: VersionedElement<Element> } {
        if (index < 0) {
            return createSelector([], () => ({}));
        }
        if (index === 0) {
            return createSelector([this.getChangesAtCommit(0)], initial => mapValues(initial, element => ({
                isFirstEncounter: true, lifeRatio: 1, lifeSpan: 1, changes: element, data: element
            })));
        }
        return createSelector([this.getDataAtCommit(index - 1), this.getChangesAtCommit(index)], (previous, changes) => {
            const existed = new Set(Object.keys(previous));
            const result: { [name: string]: VersionedElement<any> } = {};
            for (let name of new Set([...Object.keys(previous), ...Object.keys(changes)])) {
                const lifeSpan = existed.has(name) ? previous.lifeSpan + 1 : 1;
                result[name] = {
                    isFirstEncounter: !existed.has(name),
                    data: existed.has(name) ? applyChanges(previous[name], changes[name]) : changes[name],
                    changes: changes[name], lifeSpan,
                    lifeRatio: lifeSpan / (index + 1)
                };
            }
            return result;
        })
    }

    constructor(private store: Store) {
    }

    @Action(AddCommitData)
    addCommitData(ctx: StateContext<VersionsStateModel>, { commit, elements }: AddCommitData) {
        return of().pipe(tap(() => {
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
                newData[path][commit] = previous === null ? element : getDiff(previous[path].data, element);
                if (next !== null && next[path]) {
                    newData[path][commits[newIndex].name] = getDiff(element, next[path].data);
                }
            }
            ctx.setState(patch({ data: newData, versions: insertItem(commit, newIndex) }))
        }));
    }

    @Action(AddCommits)
    addCommits(ctx: StateContext<VersionsStateModel>, { commits }: AddCommits) {
        ctx.setState(patch({ commits: s => ({ ...s, ...keyBy(commits, 'name') }) }));
    }
}