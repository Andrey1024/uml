import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

export interface LinkedName {
    name: string;
    hasLink: boolean;
    link?: string;
}

@Component({
    selector: 'uml-element-info-property',
    templateUrl: './element-info-property.component.html',
    styleUrls: ['./element-info-property.component.scss'],
})
export class ElementInfoPropertyComponent implements OnInit {
    @Input() label: string;
    @Input() icon: string;

    constructor() {
    }

    ngOnInit(): void {
    }

}
