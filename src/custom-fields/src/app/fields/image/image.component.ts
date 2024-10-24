import { Component, OnInit } from '@angular/core';
import { EVENT_NAMES, ISitefinityRestService, ISitefinityService, RpcChannel } from '@progress/sitefinity-adminapp-extensions-sdk';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})
export class ImageComponent implements OnInit {
  settings: any;
  initialValue: any;
  thumbnailUrl: string = '';
  hasImage = false;

  private rpcChannel!: RpcChannel;
  private sitefinityService!: ISitefinityService;
  private sfSdk!: ISitefinityRestService;

  ngOnInit(): void {
    const parentWindow = window.parent;
    const targetOrigin = new URL(document.referrer).origin; // Get Sitefinity's origin

    // Instantiate the RPC channel
    this.rpcChannel = new RpcChannel(parentWindow, targetOrigin);

    // Get a proxy to the 'SitefinityService' to call methods on Sitefinity
    this.sitefinityService = this.rpcChannel.getService<ISitefinityService>("SitefinityService", ["setErrors", "writeValue"]);
    this.sitefinityService;

    this.sfSdk = this.rpcChannel.getService<ISitefinityRestService>("SitefinityRestService", ["configure", "get"]);
    this.sfSdk;

    this.rpcChannel.on(EVENT_NAMES.INIT, (payload: { value: any; settings: any }) => {
      this.initialValue = payload.value;
      this.settings = payload.settings;

      this.sfSdk.configure({ culture: "en" });
      const a = this.sfSdk.get();
      a.then((data) => {
        data;
      });

      try {
        if (payload.value[0]?.ThumbnailUrl) {
          this.thumbnailUrl = payload.value[0]?.ThumbnailUrl;
          this.hasImage = true;
        }
        else {
          this.hasImage = false;
        }
      } catch (error) {
        this.hasImage = false;
      }
    });
  }
}
