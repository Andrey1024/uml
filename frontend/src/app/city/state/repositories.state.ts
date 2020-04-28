import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { append, patch } from "@ngxs/store/operators";

export class LoadList {
    static readonly type = '[Repositories] load list';
}


export class Create {
    static readonly type = '[Repository] create';

    constructor(public name: string, public url: string) {
    }
}

export interface RepositoriesStateModel {
    repositories: string[];
}

@State<RepositoriesStateModel>({
    name: 'repositories',
    defaults: { repositories: [] }
})
@Injectable()
export class RepositoriesState {
    @Selector([RepositoriesState])
    static getRepositories(state: RepositoriesStateModel) {
        return state.repositories;
    }

    constructor(private http: HttpClient) {
    }

    @Action(LoadList)
    loadList(ctx: StateContext<RepositoriesStateModel>) {
        return this.http.get<string[]>("/api/repository").pipe(
            tap(repositories => ctx.setState(patch({ repositories })))
        )
    }

    @Action(Create)
    addRepository(ctx: StateContext<RepositoriesStateModel>, { name, url }: Create) {
        return this.http.post<string>(`/api/repository`, { name, url }).pipe(
            tap(() => ctx.setState(patch({ repositories: append([name]) })))
        );
    }
}