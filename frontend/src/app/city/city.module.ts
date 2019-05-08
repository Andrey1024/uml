import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CityComponent} from "./components/city/city.component";
import {SceneComponent} from './components/scene/scene.component';
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule, MatSelectModule} from "@angular/material";
import { TooltipComponent } from './components/tooltip/tooltip.component';
import {OverlayModule} from "@angular/cdk/overlay";
import {PortalModule} from "@angular/cdk/portal";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        OverlayModule,
        PortalModule
    ],
    declarations: [
        CityComponent,
        SceneComponent,
        TooltipComponent,
    ],
    entryComponents: [
        TooltipComponent
    ],
    exports: [
        CityComponent
    ]
})
export class CityModule {

}