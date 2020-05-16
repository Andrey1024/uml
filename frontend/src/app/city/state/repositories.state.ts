import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { delay, finalize, tap } from "rxjs/operators";
import { append, patch, removeItem } from "@ngxs/store/operators";
import { RepositoryInfo } from "../model/presentation/server/repository-info.model";

export class LoadList {
    static readonly type = '[Repositories] load list';
}


export class Create {
    static readonly type = '[Repository] create';

    constructor(public name: string, public url: string) {
    }
}

export class Remove {
    static readonly type = '[Repository] remove';

    constructor(public name: string) {
    }
}

export interface RepositoriesStateModel {
    repositories: RepositoryInfo[];
    pending: boolean;
}

@State<RepositoriesStateModel>({
    name: 'repositories',
    defaults: {
        repositories: null,
        pending: false
    }
})
@Injectable()
export class RepositoriesState {
    @Selector([RepositoriesState])
    static isLoaded(state: RepositoriesStateModel) {
        return state.repositories !== null;
    }

    @Selector([RepositoriesState])
    static isPending(state: RepositoriesStateModel) {
        return state.pending;
    }

    @Selector([RepositoriesState])
    static getRepositories(state: RepositoriesStateModel) {
        return state.repositories;
    }

    constructor(private http: HttpClient) {
    }

    @Action(LoadList)
    loadList(ctx: StateContext<RepositoriesStateModel>) {
        return this.http.get<RepositoryInfo[]>("/api/repository").pipe(
            tap(repositories => ctx.setState(patch({ repositories }))),
        )
    }

    @Action(Create)
    addRepository(ctx: StateContext<RepositoriesStateModel>, { name, url }: Create) {
        ctx.patchState({ pending: true });
        return this.http.post<RepositoryInfo>(`/api/repository`, { name, url }).pipe(
            tap(result => ctx.setState(patch({ repositories: append([result]) }))),
            finalize(() => ctx.patchState({ pending: false }))
        );
    }

    @Action(Remove)
    removeRepository(ctx: StateContext<RepositoriesStateModel>, { name }: Remove) {
        ctx.patchState({ pending: true });
        return this.http.delete<string>(`/api/repository/${name}`).pipe(
            tap(() => ctx.setState(patch({ repositories: removeItem(item => item.name === name) }))),
            finalize(() => ctx.patchState({ pending: false }))
        );
    }
}