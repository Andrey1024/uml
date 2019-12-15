import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasVisualizerComponent } from './components/canvas-visualizer/canvas-visualizer.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatTreeModule
} from '@angular/material';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ThreeDirective } from './directives/three.directive';
import { TreeVisualizerComponent } from './components/tree-visualizer/tree-visualizer.component';
import {NgxsModule} from "@ngxs/store";
import {CodeStructureState} from "./state/code-structure.state";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        OverlayModule,
        PortalModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatTreeModule,
        NgxsModule.forFeature([CodeStructureState])
    ],
    declarations: [
        CanvasVisualizerComponent,
        TooltipComponent,
        ThreeDirective,
        TreeVisualizerComponent,
    ],
    entryComponents: [
        TooltipComponent
    ],
    exports: [
        CanvasVisualizerComponent,
    ]
})
export class CityModule {

}
