import {Component} from '@angular/core';
import "./utils/EnableThreeExamples";
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/controls/TransformControls';
import 'three/examples/js/controls/FirstPersonControls';


@Component({
    selector: 'uml-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
}

