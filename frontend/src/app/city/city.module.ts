import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CityComponent } from "./components/city/city.component";
import { SceneComponent } from './components/scene/scene.component';

@NgModule({
    imports: [
        CommonModule
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