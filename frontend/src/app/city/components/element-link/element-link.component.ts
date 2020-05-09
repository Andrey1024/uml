import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'uml-element-link',
  templateUrl: './element-link.component.html',
  styleUrls: ['./element-link.component.scss']
})
export class ElementLinkComponent implements OnInit {
  @Input() name: string;
  @Input() hasLink: boolean = false;
  @Output() link = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
