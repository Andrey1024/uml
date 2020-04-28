import { Component, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { Create, LoadList, RepositoriesState } from "../../state/repositories.state";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { AddRepoDialogComponent } from "../../components/add-repo-dialog/add-repo-dialog.component";

@Component({
    selector: 'uml-repositories-page',
    templateUrl: './repositories-page.component.html',
    styleUrls: ['./repositories-page.component.scss']
})
export class RepositoriesPageComponent implements OnInit {
    @Select(RepositoriesState.getRepositories)
    repositories$: Observable<string[]>;

    constructor(private store: Store, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.store.dispatch(new LoadList());
    }

    createRepo() {
        this.dialog.open(AddRepoDialogComponent).afterClosed()
            .subscribe(result => {
                if (result) {
                    this.store.dispatch(new Create(result.name, result.url))
                }
            })
    }
}
