import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CityModule } from './city/city.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontService } from './city/service/font.service';

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
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
