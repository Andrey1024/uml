import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Commit } from "../../model/server-model/commit.model";
import { groupBy, toPairs } from "lodash-es";

@Component({
    selector: 'uml-add-commits',
    templateUrl: './add-commits.component.html',
    styleUrls: ['./add-commits.component.scss']
})
export class AddCommitsComponent implements OnInit, OnChanges {
    @Input() commits: Commit[];
    @Input() loaded: Commit[];
    @Input() loading: Commit[];
    @Output() load = new EventEmitter<Commit>();


    grouped;
    itemSize = 0;

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.commits) {
            this.grouped = toPairs(groupBy(this.commits, c => new Date(c.date).toDateString()));
            this.itemSize = (this.grouped.length * 48 + this.commits.length * 72) / this.grouped.length;
        }
    }
}
