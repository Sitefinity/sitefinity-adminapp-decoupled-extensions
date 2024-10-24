import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EVENT_NAMES, ISitefinityService, RpcChannel } from '@progress/sitefinity-adminapp-extensions-sdk';
import { SfInputModule } from '@progress/sitefinity-component-framework';
import { SeoAiButtonComponent } from '../seo-ai-button/seo-ai-button.component';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-seo-descripton',
  standalone: true,
  imports: [SfInputModule, CommonModule, FormsModule, SeoAiButtonComponent],
  templateUrl: './custom-seo-descripton.component.html',
  styleUrl: './custom-seo-descripton.component.scss'
})
export class CustomSeoDescriptonComponent {
  settings: any;
  content: string = "";
  private innerValue: any;
  private rpcChannel!: RpcChannel;
  private sitefinityService!: ISitefinityService;
  private sub!: Subscription;

  constructor(private store: Store<{ seoState: any }>) { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  ngOnInit(): void {
    const parentWindow = window.parent;
    const targetOrigin = new URL(document.referrer).origin; // Get Sitefinity's origin

    // Instantiate the RPC channel
    this.rpcChannel = new RpcChannel(parentWindow, targetOrigin);

    // Get a proxy to the 'SitefinityService' to call methods on Sitefinity
    this.sitefinityService = this.rpcChannel.getService<ISitefinityService>("SitefinityService", ["setErrors", "writeValue"]);

    this.rpcChannel.on(EVENT_NAMES.INIT, (payload: { value: any; settings: any }) => {
      this.innerValue = payload.value;
      this.settings = payload.settings;
      this.content = payload.settings?.dataItem?.data?.Content;
    });

    const data$ = this.store.select((state) => state.seoState);
    this.sub = data$.subscribe(data => {
      if (data?.data) {
        const input: string = data.data.choices[0].message.content;
        const descriptionMatch = input.match(/Description:\s*"(.*?)"/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        this.value = description;
      }
    });
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    this.innerValue = v;
    this.sitefinityService.writeValue(v);
  }
}
