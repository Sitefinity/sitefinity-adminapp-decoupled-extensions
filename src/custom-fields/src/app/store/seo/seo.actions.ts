

import { createAction, props } from '@ngrx/store';

export const loadSeo = createAction('[Seo] Load Seo Data', props<{ content: string }>());
export const loadSeoSuccess = createAction('[Seo] Load Seo Data Success', props<{ data: any }>());
export const loadSeoFailure = createAction('[Seo] Load Seo Data Failure', props<{ error: any }>());
