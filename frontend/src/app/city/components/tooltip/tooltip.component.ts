import { Component, OnInit } from '@angular/core';

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
        'ENUM': 'Перечисление'
    }

    object: any;

    constructor() {
    }

    ngOnInit() {
    }

}
