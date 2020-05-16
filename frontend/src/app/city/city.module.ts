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
import { AddCommitsComponent } from './containers/add-commits/add-commits.component';
import { CityComponent } from './containers/city/city.component';
import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatChipsModule } from "@angular/material/chips";
import { MatListModule } from "@angular/material/list";
import { AuthorsListComponent } from './components/authors-list/authors-list.component';
import { RepositoriesPageComponent } from './containers/repositories-page/repositories-page.component';
import { RepositoriesState } from "./state/repositories.state";
import { MatCardModule } from "@angular/material/card";
import { AddRepoDialogComponent } from './components/add-repo-dialog/add-repo-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import * as THREE from 'three';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ElementInfoComponent } from './components/element-info/element-info.component';
import { ElementInfoPropertyComponent } from './components/element-info-property/element-info-property.component';
import { ElementLinkComponent } from './components/element-link/element-link.component';
import { Visualizer } from "./services/visualizer";
import { DistrictVisualizer } from "./model/visualizers/district-visualizer";
import { StreetsVisualizer } from "./model/visualizers/streets-visualizer";
import { VersionsState } from "./state/versions.state";


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
        NgxsModule.forFeature([RepositoryState, VersionsState, RepositoriesState]),
        MatCheckboxModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatSidenavModule,
        MatProgressBarModule,
        MatChipsModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        RouterModule.forChild([
            { path: "", component: RepositoriesPageComponent },
            { path: "repository/:name", component: CityComponent }]),
        FlexLayoutModule,
        MatDialogModule
    ],
    declarations: [
        CanvasVisualizerComponent,
        TooltipComponent,
        ThreeDirective,
        TreeVisualizerComponent,
        AddCommitsComponent,
        CityComponent,
        AuthorsListComponent,
        RepositoriesPageComponent,
        AddRepoDialogComponent,
        ElementInfoComponent,
        ElementInfoPropertyComponent,
        ElementLinkComponent,
    ],
    providers: [
        { provide: Visualizer, useClass: DistrictVisualizer, multi: true },
        { provide: Visualizer, useClass: StreetsVisualizer, multi: true },
    ],
    entryComponents: [
        TooltipComponent,
        AddRepoDialogComponent
    ]
})
export class CityModule {

}
