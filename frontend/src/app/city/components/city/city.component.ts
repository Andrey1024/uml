import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as THREE from "three";
import {Element} from "../../model/element.model";
import {LayoutService} from "../../service/layout.service";
import {CityService} from "../../service/city.service";

@Component({
  selector: 'uml-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: LayoutService, useClass: CityService }]
})
export class CityComponent {
  @ViewChild('canvas', { static: true }) canvasContainer: ElementRef<HTMLDivElement>;
  objects: THREE.Object3D[] = [];

  @Input() set hierarchy(data: Element) {
    this.objects = data ? this.layoutService.place(data) : [];
  }

  constructor(private layoutService: LayoutService) {
  }
}
