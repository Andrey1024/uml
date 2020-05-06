import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Actions, ofAction, ofActionDispatched, Select, Store } from "@ngxs/store";
import { BehaviorSubject, Observable } from "rxjs";
import { Author, Commit } from "../../model/server-model/commit.model";
import { ActivatedRoute } from "@angular/router";
import { CommitsState, Load } from "../../state/commits.state";
import {
    AuthorView,
    LoadState,
    RepositoryState,
    SelectAuthors,
    SelectCommit,
    SelectNodes,
    SelectSourceRoot, SetRootPath,
    UpdateSearch
} from "../../state/repository.state";
import { ItemNode } from "../../model/tree-item.model";
import { Hierarchy } from "../../model/hierarchy.model";
import { DisplayOptions, LayoutService } from "../../service/layout.service";
import { CanvasVisualizerComponent } from "../../components/canvas-visualizer/canvas-visualizer.component";
import { switchMap, tap } from "rxjs/operators";
import { DataManageSelectors } from "../../state/data-manage.selectors";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActionContext } from "@ngxs/store/src/actions-stream";

@Component({
    selector: 'uml-city',
    templateUrl: './city.component.html',
    styleUrls: ['./city.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CityComponent implements OnInit {
    @ViewChild(CanvasVisualizerComponent, { static: true }) canvas: CanvasVisualizerComponent;

    @Select(RepositoryState.getCommitIndex)
    commitIndex$: Observable<number>;

    @Select(CommitsState.getRepositoryName)
    name$: Observable<string>

    @Select(RepositoryState.getAuthorsWithCount)
    authors$: Observable<{ author: Author, count: number }[]>;

    @Select(CommitsState.getAllCommitsDesc)
    commits$: Observable<Commit[]>;

    @Select(CommitsState.isLoaded)
    isLoaded$: Observable<boolean>;

    @Select(RepositoryState.getLoadedCommits)
    loadedCommits$: Observable<Commit[]>;

    @Select(RepositoryState.getLoadingCommits)
    loadingCommits$: Observable<Commit[]>;


    treeItems$: Observable<ItemNode[]> = this.commitIndex$.pipe(
        switchMap(i => this.store.select(DataManageSelectors.getTreeItems(i)))
    );

    hierarchy$: Observable<Hierarchy> = this.commitIndex$.pipe(
        switchMap(i => this.store.select(DataManageSelectors.getHierarchySlice(i)))
    );

    @Select(RepositoryState.getSelectedNodes)
    selectedNodes$: Observable<string[]>;

    @Select(RepositoryState.getSelectedCommit)
    selectedCommit$: Observable<string>;

    @Select(RepositoryState.getSelectedAuthors)
    selectedAuthors$: Observable<string[]>;

    sourceRoots$: Observable<any> = this.commitIndex$.pipe(
        switchMap(i => this.store.select(DataManageSelectors.getSourceRoots(i)))
    );

    @Select(RepositoryState.getSourceRoot)
    sourceRoot$: Observable<string>

    @Select(RepositoryState.getDisplayOptions)
    options$: Observable<DisplayOptions>;

    @Select(CommitsState.getAuthorsHSL)
    authorColors$: Observable<{ [email: string]: number }>;

    @Select(RepositoryState.getSearch)
    search$: Observable<string>;

    layoutNames = this.layouts.map(layout => layout.name);
    selectedLayout$ = new BehaviorSubject<string>(this.layoutNames[0]);

    constructor(private store: Store,
                private route: ActivatedRoute,
                private snackBar: MatSnackBar,
                private actions: Actions,
                @Inject(LayoutService) private layouts: LayoutService[]) {
        this.selectedLayout$.next(layouts[0].name);
        this.actions.pipe(
            ofAction(LoadState),
            tap(() => {
                const loading = this.store.selectSnapshot(RepositoryState.getLoadingCommits);
                if (loading.length > 0) {
                    this.snackBar.open(`Выполняется загрузка ${loading.length} версий`, null,
                        { horizontalPosition: "end", verticalPosition: "top" });
                } else {
                    this.snackBar.dismiss();
                }
            })
        ).subscribe();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => this.store.dispatch(new Load(params.get("name"))).subscribe(() => {
            const commits = this.store.selectSnapshot(CommitsState.getAllCommits);
            this.store.dispatch([new LoadState(commits[commits.length - 1].name)]);
        }));
    }

    selectCommit(commit: Commit) {
        this.store.dispatch(new SelectCommit(commit.name));
    }

    selectAuthors(authors: string[]) {
        this.store.dispatch(new SelectAuthors(authors));
    }

    loadCommitState(commit: Commit) {
        this.store.dispatch(new LoadState(commit.name))
    }

    selectSourceRoot(root: string) {
        this.store.dispatch(new SelectSourceRoot(root));
    }

    selectNodes(nodes: string[]) {
        this.store.dispatch(new SelectNodes(nodes));
    }

    selectAuthorsView(showAuthors: boolean) {
        this.store.dispatch(new AuthorView(showAuthors));
    }

    setPath(path: string) {
        this.store.dispatch(new SetRootPath(path));
    }

    updateSearch(search: string) {
        this.store.dispatch(new UpdateSearch(search))
    }

    focusNode(node: string) {
        this.canvas.focusOnElement(node);
    }
}
