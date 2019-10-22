import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerComponent } from './components/visualizer/visualizer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule, MatFormFieldModule, MatSelectModule, MatTabsModule } from '@angular/material';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ThreeDirective } from './directives/three.directive';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        OverlayModule,
        PortalModule,
        MatTabsModule,
        MatButtonToggleModule
    ],
    declarations: [
        VisualizerComponent,
        TooltipComponent,
        ThreeDirective,
    ],
    entryComponents: [
        TooltipComponent
    ],
    exports: [
        VisualizerComponent,
    ]
})
export class CityModule {

}
