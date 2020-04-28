import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";

@Component({
    selector: 'uml-add-repo-dialog',
    templateUrl: './add-repo-dialog.component.html',
    styleUrls: ['./add-repo-dialog.component.scss']
})
export class AddRepoDialogComponent implements OnInit {
    form = this.fb.group({
        name: ["", Validators.required],
        url: ["", Validators.required]
    })

    constructor(private fb: FormBuilder) {
    }

    ngOnInit(): void {
    }

}
