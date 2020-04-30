import { Component, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { Create, LoadList, Remove, RepositoriesState } from "../../state/repositories.state";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { AddRepoDialogComponent } from "../../components/add-repo-dialog/add-repo-dialog.component";
import { RepositoryInfo } from "../../model/server-model/repository-info.model";

@Component({
    selector: 'uml-repositories-page',
    templateUrl: './repositories-page.component.html',
    styleUrls: ['./repositories-page.component.scss']
})
export class RepositoriesPageComponent implements OnInit {
    @Select(RepositoriesState.getRepositories)
    repositories$: Observable<RepositoryInfo[]>;

    @Select(RepositoriesState.isLoaded)
    isLoaded$: Observable<boolean>;

    @Select(RepositoriesState.isPending)
    isPending$: Observable<boolean>;

    creating = false;

    constructor(private store: Store, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.store.dispatch(new LoadList());
    }

    createRepo() {
        this.dialog.open(AddRepoDialogComponent).afterClosed()
            .subscribe(result => {
                if (result) {
                    this.creating = true;
                    this.store.dispatch(new Create(result.name, result.url)).subscribe(() => this.creating = false)
                }
            })
    }

    removeRepository(event: MouseEvent, repo: string) {
        event.stopPropagation();
        this.store.dispatch(new Remove(repo));
    }
}
