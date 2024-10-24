import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools'; // Import the StoreDevtoolsModule
import { routes } from './app.routes';
import * as seoEffects from './store/seo/seo.effects';
import { seoReducer } from './store/seo/seo.reducer';
import { SeoService } from './services/seo.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideStore({ seoState: seoReducer }),
    provideEffects([seoEffects]),
    importProvidersFrom(
      StoreDevtoolsModule.instrument({ maxAge: 25 })
    ),
    SeoService
  ]
};
