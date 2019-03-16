import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Input, OnChanges,
    OnInit, SimpleChanges,
    ViewChild
} from '@angular/core';
import { SceneService } from "../../service/scene.service";
import { HierarchyRectangularNode } from "d3-hierarchy";

@Component({
    selector: 'uml-scene',
    templateUrl: './scene.component.html',
    styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, OnChanges, AfterViewInit, AfterContentInit {
    @ViewChild("canvas") canvasContainer: ElementRef<HTMLDivElement>;

    @Input() hierarchy: HierarchyRectangularNode<any>;


    constructor(private sceneService: SceneService) {
    }

    @HostListener('window:resize', ['$event'])
    public onResize(event: Event) {
        this.sceneService.resize();
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.sceneService.init(this.canvasContainer.nativeElement);
    }

    ngAfterContentInit() {

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hierarchy && this.hierarchy) {
            this.sceneService.addHierarchy(this.hierarchy);
        }
    }
}
