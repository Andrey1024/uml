import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CityModule } from './city/city.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from "@ngxs/store";
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { environment } from "../environments/environment";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FlexLayoutModule } from "@angular/flex-layout";
import { registerLocaleData } from "@angular/common";
import localeRu from "@angular/common/locales/ru";

registerLocaleData(localeRu);

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot([]),
        BrowserAnimationsModule,
        NgxsModule.forRoot([], {
            selectorOptions: { injectContainerState: false },
            developmentMode: !environment.production
        }),
        CityModule,
        NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
        MatToolbarModule,
        FlexLayoutModule
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'ru-RU'}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}