import { Component, OnInit } from "@angular/core";
import { EVENT_NAMES, ISitefinityService, RpcChannel } from "@progress/sitefinity-adminapp-extensions-sdk";

@Component({
  selector: "warning",
  templateUrl: "./warning.component.html",
  standalone: true
})
export class WarningComponent implements OnInit {
  settings: any;

  private rpcChannel!: RpcChannel;
  private sitefinityService!: ISitefinityService;

  ngOnInit(): void {
    const parentWindow = window.parent;
    const targetOrigin = new URL(document.referrer).origin; // Get Sitefinity's origin

    // Instantiate the RPC channel
    this.rpcChannel = new RpcChannel(parentWindow, targetOrigin);

    // Get a proxy to the 'SitefinityService' to call methods on Sitefinity
    this.sitefinityService = this.rpcChannel.getService<ISitefinityService>("SitefinityService", ["setErrors", "writeValue"]);

    this.rpcChannel.on(EVENT_NAMES.INIT, (payload: { value: any; settings: any }) => {
      if (this.settings && this.settings.required) {
        this.sitefinityService.setErrors("This field is required");
      }
    });


  }
}
