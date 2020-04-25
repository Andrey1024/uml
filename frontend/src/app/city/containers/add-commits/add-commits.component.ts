import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Commit } from "../../model/server-model/commit.model";

@Component({
  selector: 'uml-add-commits',
  templateUrl: './add-commits.component.html',
  styleUrls: ['./add-commits.component.scss']
})
export class AddCommitsComponent implements OnInit {
  @Input() commits: Commit[];
  @Output() load = new EventEmitter<Commit>();

  constructor() { }

  ngOnInit(): void {
  }

}
