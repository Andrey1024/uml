import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { Actions, ofAction, Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { Commit } from "../../model/presentation/server/commit.model";
import { ActivatedRoute } from "@angular/router";
import {
    LoadChanges,
    LoadState,
    OpenRepository,
    RepositoryState,
    SelectAuthors,
    SelectCommit, SelectCompareTo,
    SelectDetails,
    SelectSourceRoot,
    SetRootPath,
    UpdateSearch
} from "../../state/repository.state";
import { ItemNode } from "../../model/tree-item.model";
import { CanvasVisualizerComponent } from "../../components/canvas-visualizer/canvas-visualizer.component";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { VersionsState } from "../../state/versions.state";
import {
    IgnoreAuthors,
    SelectDetailLevel,
    SelectMethod,
    ShowAuthors,
    VisualizerState
} from "../../state/visualizer.state";
import { ElementConnections } from "../../model/presentation/element-connections";
import { VisualizerOptions } from "../../services/visualizer";
import { ById } from "../../model/by-id";

@Component({
    selector: 'uml-city',
    templateUrl: './city.component.html',
    styleUrls: ['./city.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CityComponent implements OnInit {
    @ViewChild(CanvasVisualizerComponent, { static: true }) canvas: CanvasVisualizerComponent;

    @Select(VisualizerState.getMethods)
    methods$: Observable<string[]>;

    @Select(VisualizerState.getVisualizerOptions)
    options$: Observable<VisualizerOptions>;

    @Select(VisualizerState.getSelectedMethod)
    selectedMethod$: Observable<string>;

    @Select(RepositoryState.getSelectedVersionIndex)
    commitIndex$: Observable<number>;

    @Select(RepositoryState.getRepository)
    name$: Observable<string>;

    @Select(VersionsState.getCommitsDesc)
    commits$: Observable<Commit[]>;

    @Select(VersionsState.getVersionCommits)
    versions$: Observable<Commit[]>;

    @Select(RepositoryState.getSelectedVersion)
    selectedCommit$: Observable<string>;

    @Select(RepositoryState.getVersionCompareTo)
    versionCompareTo$: Observable<string>;

    @Select(RepositoryState.getSelectedElementName)
    selectedElementName$: Observable<string>;

    @Select(RepositoryState.getSelectedSourceRoot)
    sourceRoot$: Observable<string>

    @Select(RepositoryState.getSearch)
    search$: Observable<string>;

    @Select(VisualizerState.getDetailLevel)
    detailLevel$: Observable<'method' | 'class'>;

    @Select(RepositoryState.getCompareToIndex)
    compareToIndex$: Observable<number>;

    @Select(VisualizerState.areAuthorsShown)
    showAuthors$: Observable<boolean>;

    @Select(RepositoryState.getAuthorsWithCount)
    authors$: Observable<any>;

    @Select(VisualizerState.getIgnoredAuthors)
    ignoredAuthors$: Observable<string[]>;

    @Select(VisualizerState.getAuthorColors)
    authorColors$: Observable<ById<number>>

    treeItems$: Observable<ItemNode[]> = combineLatest([this.commitIndex$, this.compareToIndex$]).pipe(
        switchMap(([i, c]) => this.store.select(RepositoryState.getSelectedTree(i, c))));

    selectedElement$: Observable<ElementConnections> = this.commitIndex$.pipe(switchMap(i => this.store.select(RepositoryState.getElementDetails(i))));

    sourceRoots$: Observable<string[]> = this.commitIndex$.pipe(switchMap(i => this.store.select(RepositoryState.getSourceRoots(i))));

    elementNames$: Observable<ById<string>> = this.commitIndex$.pipe(switchMap(i => this.store.select(RepositoryState.getElementList(i))));

    compareVersions$: Observable<Commit[]> = this.commitIndex$.pipe(switchMap(i => this.store.select(RepositoryState.getVersionsToCompare(i))));

    constructor(private store: Store,
                private route: ActivatedRoute,
                private actions: Actions,
                private snackBar: MatSnackBar) {
        this.actions.pipe(
            ofAction(LoadState),
            tap(() => {
                const loading = this.store.selectSnapshot(RepositoryState.getLoadingCount);
                if (loading > 0) {
                    this.snackBar.open(`Выполняется загрузка ${loading} версий`, null,
                        { horizontalPosition: "center", verticalPosition: "top", panelClass: 'toast-message' });
                } else {
                    this.snackBar.dismiss();
                }
            })
        ).subscribe();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => this.store.dispatch(new OpenRepository(params.get("name"))));
    }

    selectCommit(commit: string) {
        this.store.dispatch(new SelectCommit(commit));
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

    selectPath(path: string) {
        this.store.dispatch(new SetRootPath(path));
    }

    selectMethod(method: string) {
        this.store.dispatch(new SelectMethod(method));
    }

    updateSearch(search: string) {
        this.store.dispatch(new UpdateSearch(search))
    }

    selectElement(name: string) {
        this.elementNames$.pipe(take(1), filter(names => !!names[name])).subscribe(
            () => this.store.dispatch(new SelectDetails(name))
        );
    }

    selectDetailLevel(level) {
        this.store.dispatch(new SelectDetailLevel(level));
    }

    selectCompareVersion(version: string) {
        this.store.dispatch(new SelectCompareTo(version));
    }

    showAuthors(flag: boolean) {
        this.store.dispatch(new ShowAuthors(flag));
    }

    ignoreAuthors(ignored: string[]) {
        this.store.dispatch(new IgnoreAuthors(ignored));
    }
}
