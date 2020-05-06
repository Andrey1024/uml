import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Author } from "../../model/server-model/commit.model";
import { SelectionModel } from "@angular/cdk/collections";
import { MatListOption } from "@angular/material/list";
import { map } from "lodash-es";

@Component({
    selector: 'uml-authors-list',
    templateUrl: './authors-list.component.html',
    styleUrls: ['./authors-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorsListComponent implements OnInit {
    @Input() authors: { author: Author, count: number }[];
    @Input() authorColors: { [email: string]: number };
    @Input() selected: string[];
    @Output() select = new EventEmitter<string[]>();

    getHslString(email: string) {
        return `hsl(${this.authorColors[email]},100%,50%)`;
    }

    constructor() {
    }

    ngOnInit(): void {
    }

    areAllSelected(): boolean {
        return this.authors.every(a => this.selected.includes(a.author.email));
    }

    toggleAll() {
        this.select.emit(this.areAllSelected() ? [] : map(this.authors, 'author.email'));
    }

    onSelect(options: SelectionModel<MatListOption>) {
        this.select.emit(options.selected.map(o => o.value));
    }
}
