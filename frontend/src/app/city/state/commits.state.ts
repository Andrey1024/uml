import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Author, Commit } from "../model/server-model/commit.model";
import { HttpClient } from "@angular/common/http";
import { finalize, tap } from "rxjs/operators";
import { patch } from "@ngxs/store/operators";
import { Injectable } from "@angular/core";
import { LoadState } from "./repository.state";

export class Load {
    static readonly type = '[Repository] load';

    constructor(public name: string) {
    }
}

export class Create {
    static readonly type = '[Repository] create';

    constructor(public name: string, public url: string) {
    }
}

export interface CommitsStateModel {
    repositoryName: string;
    byId: { [name: string]: Commit };
    ids: string[];
    loaded: boolean;
}

@State<CommitsStateModel>({
    name: 'commits',
    defaults: {
        repositoryName: null,
        byId: {},
        ids: [],
        loaded: false
    }
})
@Injectable()
export class CommitsState {
    @Selector([CommitsState])
    static getRepositoryName(state: CommitsStateModel) {
        return state.repositoryName;
    }

    @Selector([CommitsState])
    static getAllCommits(state: CommitsStateModel) {
        return state.ids.map(id => state.byId[id]).sort((a, b) => +a.date - +b.date);
    }

    @Selector([CommitsState.getAllCommits])
    static getAuthorList(commits: Commit[]): Author[] {
        return [...new Set(commits.map(commit => commit.author))].slice(0, 50);
    }

    @Selector([CommitsState])
    static isLoaded(state: CommitsStateModel) {
        return state.loaded;
    }

    constructor(private http: HttpClient) {
    }

    @Action(Load)
    openRepository(ctx: StateContext<CommitsStateModel>, { name }: Load) {
        ctx.patchState({ loaded: false, repositoryName: name });
        return this.http.get<Commit[]>(`/api/repository/${name}`).pipe(
            tap(commits => ctx.setState(patch({
                byId: commits.reduce((res, com) => ({ ...res, [com.name]: com }), {}),
                ids: commits.map(commit => commit.name)
            }))),
            finalize(() => ctx.patchState({ loaded: true })),
        );
    }

    @Action(Create)
    addRepository(ctx: StateContext<CommitsStateModel>, { name, url }: Create) {
        ctx.patchState({ loaded: false, repositoryName: name });
        return this.http.post<Commit[]>(`/api/repository`, { name, url }).pipe(
            tap(commits => ctx.setState(patch({
                byId: commits.reduce((res, com) => ({ ...res, [com.name]: com }), {}),
                ids: commits.map(commit => commit.name)
            }))),
            finalize(() => ctx.patchState({ loaded: true }))
        );
    }
}