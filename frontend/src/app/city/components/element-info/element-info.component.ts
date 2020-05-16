import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Element } from "../../model/presentation/server/element";
import { isString } from "lodash-es";

@Component({
  selector: 'uml-element-info',
  templateUrl: './element-info.component.html',
  styleUrls: ['./element-info.component.scss']
})
export class ElementInfoComponent implements OnInit {
  readonly types = {
    'CLASS': 'Класс',
    'INTERFACE': 'Интерфейс',
    'ENUM': 'Перечисление'
  }

  @Input() element: any;
  @Output() link = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  hasLink(name): boolean {
    return !!name && !isString(name);
  }
}
