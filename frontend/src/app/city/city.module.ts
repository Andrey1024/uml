import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CityComponent} from "./components/city/city.component";
import {SceneComponent} from './components/scene/scene.component';
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule, MatSelectModule} from "@angular/material";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule
    ],
    declarations: [
        CityComponent,
        SceneComponent,
    ],
    exports: [
        CityComponent
    ]
})
export class CityModule {

}