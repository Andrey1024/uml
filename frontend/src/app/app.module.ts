import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CityModule } from './city/city.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontService } from './city/service/font.service';
import { LayoutService } from './city/service/layout.service';
import { CityService } from './city/service/city.service';
import { StreetsService } from './city/service/streets.service';
import { NgxsModule } from "@ngxs/store";
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { environment } from "../environments/environment";

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        CityModule,
        BrowserAnimationsModule,
        NgxsModule.forRoot(),
        NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production })
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (fontService: FontService) => () => fontService.init(),
            deps: [FontService],
            multi: true
        },
        { provide: LayoutService, useClass: CityService, multi: true },
        { provide: LayoutService, useClass: StreetsService, multi: true },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}