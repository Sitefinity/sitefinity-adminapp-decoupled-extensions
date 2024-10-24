import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { SeoService } from '../../services/seo.service';
import { loadSeo, loadSeoFailure, loadSeoSuccess } from './seo.actions';

export const seoEff = createEffect(
  (actions$ = inject(Actions), actorsService = inject(SeoService)) => {
    return actions$.pipe(
      ofType(loadSeo),
      exhaustMap((ef) =>
        from(actorsService.getSeoData(ef.content)).pipe(
          map((data) => loadSeoSuccess({ data })),
          catchError((error: { message: string }) =>
            of(loadSeoFailure({ error}))
          )
        )
      )
    );
  },
  { functional: true }
);
