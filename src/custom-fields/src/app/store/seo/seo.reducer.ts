

import { createReducer, on } from '@ngrx/store';
import * as SeoActions from './seo.actions';

export interface SeoState {
  data: any;
  error: any;
}

export const initialState: SeoState = {
  data: null,
  error: null,
};

export const seoReducer = createReducer(
  initialState,
  on(SeoActions.loadSeoSuccess, (state, { data }) => ({ ...state, data })),
  on(SeoActions.loadSeoFailure, (state, { error }) => ({ ...state, error })),
);
