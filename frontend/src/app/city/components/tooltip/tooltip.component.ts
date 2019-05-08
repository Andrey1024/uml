import {Component, OnInit} from '@angular/core';
import {Element} from "../../model/element.model";

@Component({
    selector: 'uml-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
    object: Element;

    constructor() {
    }

    ngOnInit() {
    }

}
