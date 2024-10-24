import { Component, OnInit } from "@angular/core";
import { SfInputModule } from "@progress/sitefinity-component-framework";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EVENT_NAMES, ISitefinityService, RpcChannel } from "@progress/sitefinity-adminapp-extensions-sdk";

@Component({
  selector: "custom-short-text",
  templateUrl: "./custom-short-text.component.html",
  standalone: true,
  imports: [SfInputModule, CommonModule, FormsModule],
})
export class CustomShortTextComponent implements OnInit {
  settings: any;
  private innerValue: any;
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
      this.innerValue = payload.value;
      this.settings = payload.settings;
      this.validate();
    });
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    this.innerValue = v;
    this.sitefinityService.writeValue(v);
    this.validate();
  }

  private validate() {
    if (this.settings) {
      if (this.settings.required && !this.value) {
        this.sitefinityService.setErrors("This field is required");
      } else if (this.value?.length > this.settings.maxValue) {
        this.sitefinityService.setErrors(`Over the limit of ${this.settings.maxValue} characters`);
      } else if (this.value?.length < this.settings.minValue) {
        this.sitefinityService.setErrors(`Under the limit of ${this.settings.minValue} characters`);
      } else {
        this.sitefinityService.setErrors(null);
      }
    }
  }
}
