import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Author } from "../../model/presentation/server/commit.model";
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
    @Input() ignored: string[];
    @Output() ignore = new EventEmitter<string[]>();

    getHslString(email: string) {
        return `hsl(${this.authorColors[email]},100%,50%)`;
    }

    constructor() {
    }

    ngOnInit(): void {
    }

    areAllSelected(): boolean {
        return this.ignored.length === 0;
    }

    toggleAll() {
        this.ignore.emit(this.areAllSelected() ? map(this.authors, 'author.email') : []);
    }

    toggle(email: string) {
        this.ignore.emit(this.ignored.includes(email) ? this.ignored.filter(v => v !== email) : [...this.ignored, email]);
    }
}
