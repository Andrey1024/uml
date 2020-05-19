import { Component, Input, OnInit } from '@angular/core';
import { Element } from "../../model/presentation/server/element";

@Component({
    selector: 'uml-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
    readonly types = {
        'PACKAGE': 'Пакет',
        'CLASS': 'Класс',
        'INTERFACE': 'Интерфейс',
        'ENUM': 'Перечисление',
        'METHOD': 'Метод'
    }

    @Input() data: Element;

    constructor() {
    }

    ngOnInit() {
    }

}
