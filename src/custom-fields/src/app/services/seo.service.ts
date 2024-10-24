import { Injectable } from "@angular/core";
import { ISitefinityRestService, RpcChannel } from "@progress/sitefinity-adminapp-extensions-sdk";

@Injectable()
export class SeoService {
  private rpcChannel: RpcChannel;
  private sfSdk: ISitefinityRestService;

  constructor() {
    const parentWindow = window.parent;
    const targetOrigin = new URL(document.referrer).origin;
    this.rpcChannel = new RpcChannel(parentWindow, targetOrigin);
    this.sfSdk = this.rpcChannel.getService<ISitefinityRestService>("SitefinityRestService", ["configure", "get", "create"]);
  }

  getSeoData(content: string) {
    this.sfSdk.configure({ culture: "en" });
    const data = this.sfSdk.create<any>(undefined, "AIService/Chat", {
      OperationName: "GenerateSeoText",
      Properties: {
        Content: content
      }
    });
    return data;
  }
}
