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

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        CityModule,
        BrowserAnimationsModule
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
        { provide: LayoutService, useClass: CityService, multi: true},
        { provide: LayoutService, useClass: StreetsService, multi: true},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
