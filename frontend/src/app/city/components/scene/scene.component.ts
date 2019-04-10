import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Input, NgZone,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {SceneService} from "../../service/scene.service";
import {Element} from "../../model/element.model";

@Component({
    selector: 'uml-scene',
    templateUrl: './scene.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, OnChanges, AfterViewInit, AfterContentInit {
    @ViewChild("canvas") canvasContainer: ElementRef<HTMLDivElement>;

    @Input() hierarchy: Element;


    constructor(private sceneService: SceneService, private ngZone: NgZone) {
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
            this.ngZone.runOutsideAngular(() => {
                setTimeout(() => this.sceneService.show(this.hierarchy));
            });
        }
    }
}
