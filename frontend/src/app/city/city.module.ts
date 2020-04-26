import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasVisualizerComponent } from './components/canvas-visualizer/canvas-visualizer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ThreeDirective } from './directives/three.directive';
import { TreeVisualizerComponent } from './components/tree-visualizer/tree-visualizer.component';
import { NgxsModule } from "@ngxs/store";
import { RepositoryState } from "./state/repository.state";
import { MatSliderModule } from "@angular/material/slider";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AddRepositoryDialogComponent } from './containers/add-repository-dialog/add-repository-dialog.component';
import { AddCommitsComponent } from './containers/add-commits/add-commits.component';
import { CityComponent } from './containers/city/city.component';
import { RouterModule } from "@angular/router";
import { CommitsState } from "./state/commits.state";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatChipsModule } from "@angular/material/chips";
import { MatListModule } from "@angular/material/list";

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
        MatToolbarModule,
        MatSliderModule,
        NgxsModule.forFeature([RepositoryState, CommitsState]),
        MatCheckboxModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatSidenavModule,
        MatChipsModule,
        MatListModule,
        RouterModule.forChild([
            { path: "", component: AddRepositoryDialogComponent },
            { path: ":name", component: CityComponent }]),
        FlexLayoutModule
    ],
    declarations: [
        CanvasVisualizerComponent,
        TooltipComponent,
        ThreeDirective,
        TreeVisualizerComponent,
        AddRepositoryDialogComponent,
        AddCommitsComponent,
        CityComponent,
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
