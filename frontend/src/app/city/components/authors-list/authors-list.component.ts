import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Author } from "../../model/server-model/commit.model";

@Component({
    selector: 'uml-authors-list',
    templateUrl: './authors-list.component.html',
    styleUrls: ['./authors-list.component.scss']
})
export class AuthorsListComponent implements OnInit {
    @Input() authors: { author: string, count: number }[];
    @Input() selected: Set<string>;
    @Output() select = new EventEmitter<string[]>();

    constructor() {
    }

    ngOnInit(): void {
    }
}
