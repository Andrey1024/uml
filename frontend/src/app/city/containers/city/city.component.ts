import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Actions, ofAction, Select, Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { Author, Commit } from "../../model/presentation/server/commit.model";
import { ActivatedRoute } from "@angular/router";
import { CommitsState, Load } from "../../state/commits.state";
import {
    AuthorView,
    LoadState,
    RepositoryState,
    SelectAuthors,
    SelectCommit, SelectDetails,
    SelectSourceRoot,
    SetRootPath,
    UpdateSearch
} from "../../state/repository.state";
import { ItemNode } from "../../model/tree-item.model";
import { Hierarchy } from "../../model/hierarchy.model";
import { CanvasVisualizerComponent } from "../../components/canvas-visualizer/canvas-visualizer.component";
import { map, switchMap, tap } from "rxjs/operators";
import { DataManageSelectors } from "../../state/data-manage.selectors";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Element } from "../../model/presentation/server/element";
import { Visualizer } from "../../services/visualizer";

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

    @Select(RepositoryState.getSelectedCommit)
    selectedCommit$: Observable<string>;

    @Select(RepositoryState.getSelectedAuthors)
    selectedAuthors$: Observable<string[]>;

    sourceRoots$: Observable<any> = this.commitIndex$.pipe(
        switchMap(i => this.store.select(RepositoryState.getSourceRoots(i)))
    );

    @Select(RepositoryState.getSourceRoot)
    sourceRoot$: Observable<string>

    @Select(RepositoryState.getDisplayOptions)
    options$: Observable<any>;

    @Select(CommitsState.getAuthorsHSL)
    authorColors$: Observable<{ [email: string]: number }>;

    @Select(RepositoryState.getSearch)
    search$: Observable<string>;

    selectedElement$: Observable<Element> = this.commitIndex$.pipe(
        switchMap(i => this.store.select(RepositoryState.getSelectedElement(i)))
    );

    layoutNames = this.layouts.map(layout => layout.name);
    selectedLayout$ = new BehaviorSubject<string>(this.layoutNames[0]);




    constructor(private store: Store,
                private route: ActivatedRoute,
                private snackBar: MatSnackBar,
                private actions: Actions,
                @Inject(Visualizer) private layouts: Visualizer[]) {
        this.selectedLayout$.next(layouts[0].name);
        this.actions.pipe(
            ofAction(LoadState),
            tap(() => {
                const loading = this.store.selectSnapshot(RepositoryState.getLoadingCommits);
                if (loading.length > 0) {
                    this.snackBar.open(`Выполняется загрузка ${loading.length} версий`, null,
                        { horizontalPosition: "center", verticalPosition: "top", panelClass: 'toast-message' });
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

    selectElement(name: string) {
        this.store.dispatch(new SelectDetails(name));
    }
}
