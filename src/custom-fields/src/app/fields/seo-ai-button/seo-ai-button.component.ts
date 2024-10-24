import { CommonModule } from '@angular/common';
import { Component, DoCheck, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { SfButtonModule } from '@progress/sitefinity-component-framework';
import * as SeoActions from './../../store/seo/seo.actions';

@Component({
  selector: 'app-seo-ai-button',
  standalone: true,
  imports: [CommonModule, SfButtonModule],
  templateUrl: './seo-ai-button.component.html',
  styleUrl: './seo-ai-button.component.scss'
})
export class SeoAiButtonComponent implements DoCheck {
  constructor(private store: Store<{ seoState: any }>) { }


  @Input() content: string = "";

  title = "Use AI";
  disabled = !(this.content && this.content.length > 0);

  ngDoCheck(): void {
    this.disabled = !(this.content && this.content.length > 0);
  }

  onClick() {
    this.store.dispatch(SeoActions.loadSeo({ content: this.content }));
  }
}
