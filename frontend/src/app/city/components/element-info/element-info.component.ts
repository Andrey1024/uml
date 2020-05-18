import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Element } from "../../model/presentation/server/element";
import { isString } from "lodash-es";
import { EnumModel } from "../../model/presentation/server/enum.model";
import { ClassConnections } from "../../model/presentation/class-connections";
import { InterfaceConnections } from "../../model/presentation/interface-connections";
import { ById } from "../../model/by-id";

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

  @Input() element: EnumModel | ClassConnections | InterfaceConnections;
  @Input() links: ById<string>;
  @Output() link = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }
}
