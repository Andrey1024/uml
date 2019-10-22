import {ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnInit, ViewChild} from '@angular/core';
import {LayoutService} from "../../service/layout.service";
import {StreetsService} from "../../service/streets.service";
import {Element} from "../../model/element.model";
import * as THREE from "three";

@Component({
  selector: 'uml-street',
  templateUrl: './street.component.html',
  styleUrls: ['./street.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: LayoutService, useClass: StreetsService }]
})
export class StreetComponent {
  @ViewChild('canvas', { static: true }) canvasContainer: ElementRef<HTMLDivElement>;
  objects: THREE.Object3D[] = [];

  @Input() set hierarchy(data: Element) {
    this.objects = data ? this.layoutService.place(data) : [];
  }

  constructor(private layoutService: LayoutService) {
  }
}
