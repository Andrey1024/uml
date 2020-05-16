import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Commit } from "../../model/presentation/server/commit.model";
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


    dateIndices: number[];

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.commits) {
            const dateIndices = [];
            let date = '';
            for (let i = 0; i < this.commits.length; i++) {
                if (this.commits[i].date !== date) {
                    date = this.commits[i].date;
                    dateIndices.push(i);
                }
            }
            this.dateIndices = dateIndices;
        }
    }
}
