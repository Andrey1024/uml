import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {Project} from "../../model/project.model";
import { Hierarchy } from "../../model/hierarchy.model";

@Component({
  selector: 'uml-tree-visualizer',
  templateUrl: './tree-visualizer.component.html',
  styleUrls: ['./tree-visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeVisualizerComponent implements OnInit {
  @Input() hierarchy: Hierarchy;
  @Input() selected: string[];

  @Output() select = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() {
  }

}
