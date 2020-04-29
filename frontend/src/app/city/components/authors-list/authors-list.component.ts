import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Author } from "../../model/server-model/commit.model";
import { SelectionModel } from "@angular/cdk/collections";
import { MatListOption } from "@angular/material/list";

@Component({
    selector: 'uml-authors-list',
    templateUrl: './authors-list.component.html',
    styleUrls: ['./authors-list.component.scss']
})
export class AuthorsListComponent implements OnInit {
    @Input() authors: { author: Author, count: number }[];
    @Input() selected: string[];
    @Output() select = new EventEmitter<string[]>();

    constructor() {
    }

    ngOnInit(): void {
    }

    onSelect(options: SelectionModel<MatListOption>) {
        this.select.emit(options.selected.map(o => o.value));
    }
}
