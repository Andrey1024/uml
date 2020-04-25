import { Component, Inject, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Author, Commit } from "../../model/server-model/commit.model";
import { ActivatedRoute } from "@angular/router";
import { CommitsState, Load } from "../../state/commits.state";
import { LoadState, RepositoryState, SelectCommit, SelectSourceRoot } from "../../state/repository.state";
import { ItemNode } from "../../model/tree-item.model";
import { Hierarchy } from "../../model/hierarchy.model";
import { LayoutService } from "../../service/layout.service";

@Component({
    selector: 'uml-city',
    templateUrl: './city.component.html',
    styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {
    @Select(CommitsState.getAllCommits)
    commits$: Observable<Commit[]>;

    @Select(CommitsState.isLoaded)
    isLoaded$: Observable<boolean>;

    @Select(RepositoryState.getLoadedCommits)
    loadedCommits$: Observable<Commit[]>;

    @Select(RepositoryState.getTreeItems)
    treeItems$: Observable<ItemNode[]>;

    @Select(RepositoryState.getHierarchy)
    hierarchy$: Observable<Hierarchy>;

    @Select(RepositoryState.getSelectedNodes)
    selectedNodes$: Observable<Set<string>>;

    @Select(RepositoryState.getSelectedCommit)
    selectedCommit$: Observable<string>;

    layoutNames = this.layouts.map(layout => layout.name);
    selectedLayout$ = new BehaviorSubject<string>(this.layoutNames[0]);

    constructor(private store: Store,
                private route: ActivatedRoute,
                @Inject(LayoutService) private layouts: LayoutService[]) {
        this.selectedLayout$.next(layouts[0].name);
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => this.store.dispatch(new Load(params.get("name"))).subscribe(() => {
            const commits = this.store.selectSnapshot(CommitsState.getAllCommits);
            this.store.dispatch([new LoadState(commits[0].name), new LoadState(commits[commits.length - 1].name)]);
        }));
    }

    selectCommit(commit: Commit) {
        this.store.dispatch(new SelectCommit(commit.name));
    }

    loadCommitState(commit: Commit) {
        this.store.dispatch(new LoadState(commit.name))
    }

    selectSource(path: string) {
        this.store.dispatch(new SelectSourceRoot(path));
    }
}
