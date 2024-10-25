# Sitefinity AdminApp Decoupled Extension

## Overview

This repository provides a foundational setup to help you quickly begin developing technology agnostic extensions for Sitefinity. Please review this documentation carefully to familiarize yourself with the essential principles, allowing you to choose the development process and technology stack that best suits your needs.

Note: The API needed is included in `@progress/sitefinity-adminapp-extensions-sdk`, please run `npm i @progress/sitefinity-adminapp-extensions-sdk`

**Important**: The web security module must be enabled and configured properly in order for the decoupled extensions to work.

**Important**: The extensibility feature is additionaly configured in Sitefinity > Administration > Settings > Advanced > AdminAppExtensions (or `[domain.com]/Sitefinity/Administration/Settings/advanced/adminappextensions`). This is an Administrator only setting, the feature can be disabled as a whole, if enabled, you can choose whether to enable only the custom fields part of the feature or the rich text editor extensibility or both. Please note that if you wrongly input the URL of where the extensibility files are hosted, and the feature is enabled, errors in the console are expected.

## Configuring Sitefinity's web security module

Go to Sitefinity > Administration > Settings > Web security 

In the Trusted sources (Content-Security-Policy) add the following
- Scripts - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Styles  - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Fonts  - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Images - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Video and audio - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Frames - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Frame ancestors - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Connect sources - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.
- Objects - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.

In the X-Frame-OPTIONS
- On pages from other sites...  - Add all Sitefinity sites urls, the external renderer url and the url of the your application or service hosting the extensions.

## Rich Text Editor Extensions

### Registering Your Custom Tool

To register a new tool in the Rich Text Editor, the following steps **must** be strictly followed:

1. Navigate to **Sitefinity > Administration > Settings > Backend Interface > Rich Text Editor**.
2. Within the Default toolset, or any custom toolset you have configured, add your custom tool to the tools array as shown below:

   
```json
   {
     "name": "myCustomTool",
     "functionName": "myCustomToolExec",
     "tooltip": "My custom tool does some work"
   }
```

 **Important:** Even though the UI does not prompt for the functionName property, it is **mandatory** for custom tools. If this property is omitted or misspelled, the tool **will** malfunction.

### Registering the Exec Function for Your Custom Tool

In this repository, you **must** ensure that the build process produces the following under the dist folder after running npm run build:

- For the rich text editor, the files **must** be deployed under /dist/sfextensions/rte.

1. **manifest.json**: This file **must** be valid JSON and **must** contain an entry point file (key) named index. For example:

   
```json
   {
     "index": "index.abcdefg12345678.js"
   }
```

   The manifest.json is crucial because the index.js file **must** include a hash in its name to facilitate effective caching and cache busting.

2. **index.js**: This file can contain any JavaScript code, provided the following conditions are met:

   - The function specified in the functionName property **must** be attached to the window object.
   - The function specified in the functionName property **must** have a return type of void and accept only two parameters: of type Event and of type SfToolContext.

   Example:

```js
   let globalObject = typeof window !== "undefined" ? window : global;

   function myCustomToolExec(e, sfContext) {
     e.preventDefault();
     console.log("Hi mom!");
   }

   registerCustomTool("myCustomToolExec", myCustomToolExec);
```

   This file can contain any JavaScript or TypeScript code. For example:

```ts
   function myCustomToolExec(e: Event, sfContext: SfToolContext) {
     if (e.preventDefault) {
       e.preventDefault();
     }
     const that = this;
     const sdk: Sitefinity = sfContext.restSdk;
     const dataItem = sfContext.dataItem;
     getFirstAlbumId(sdk).then((data: any) => {
       const firstAlbumId = data.value[0].Id;
       takeScreenshot().then((screenshot) => {
         that.exec("inserthtml", {
           value: `<img src="\${screenshot}" alt="Screenshot" />`,
         });
       });
     });
   }

   registerCustomTool("myCustomToolExec", myCustomToolExec);
```

### Tool Icons

To change the icon of your tool, you must call the registerToolIcons function. This function can only be called once. The default icon is a gear.

The following code sample demonstrates how to set icon and tooltip for a tool:

```ts
registerToolIcons(() => {
  // Get the kendo object from the window object
  const kendo = (window as any).kendo || {};
  // This line sets the icon of the element if it's in the main toolbar
  kendo?.ui?.icon(
    $('.k-button[title="My custom tool does some work"] .k-icon'),
    { icon: "camera" }
  );
  // This line sets the icon of the element if it's in the "more tools" dropdown
  kendo?.ui?.icon(
    $("li.k-item.k-menu-item[title='My custom tool does some work'] span.k-icon"),
    { icon: "camera" }
  );
});
```

### Provided API in the Scope of the Function

In the scope of the custom tool you register, the provided API is as follows:

```js
function myCustomToolExec(e, sfContext){
  this
  // e - the event that is propagated by clicking on the tool
  // sfContext.dataItem - the item you are working with
  // sfContext.restSdk - authenticated instance of the RestSdk Service
  // this - instance of the Kendo Editor
}
```

- The function `this` is an instance of the Kendo jQuery editor. Here is a [link](https://docs.telerik.com/kendo-ui/api/javascript/ui/editor) to Kendo's API documentation for the editor. Please note that the editor is already configured at the point where you will be executing your tool's logic. Reconfiguring the editor via this API is not supported.

- There is an authenticated instance of the Sitefinity SDK in the second parameter of the function. The instance will use the token of the user you are currently authenticated with. More documentation on how to use the web services SDK can be found inside its package @progress/sitefinity-webservices-sdk or [here](https://www.npmjs.com/package/@progress/sitefinity-webservices-sdk?activeTab=readme).

- Additionally, in the second parameter of the function, there will be an object that represents the current content item you are working with (e.g., if you are working with a news item). The data you will access will look like the following. Note that this sample has been heavily truncated. Also, this is not an instance of an object; it is a snapshot of the item at the moment you open it for create/edit/duplicate/translate, and values in this object will not reflect any changes after the moment you open it.

```json
{
  "data": {
    "Id": "9d0d7d07-c8c4-4da2-90df-47c3dff00b22",
    "Title": "Some news item",
    "PublicationDate": "2024-10-08T07:50:36Z",
    "LastModified": "2024-10-08T07:50:35Z",
    "IncludeInSitemap": true,
    "UrlName": "some-news-item",
    "ItemDefaultUrl": "/2024/10/08/some-news-item",
    "AllowComments": true,
    "Author": "Admin Admin",
    "Provider": "OpenAccessDataProvider",
    "DisplayStatus": [
      {
        "Name": "Published",
        "Date": "2024-10-08T07:50:36.057Z"
      }
    ],
    "FirstPublished": {
      "Date": "2024-10-08T07:50:36.057Z"
    },
    "LastPublished": {
      "Date": "2024-10-08T07:50:36.057Z"
    }
  }
}
```

## Custom Fields Extensions

### Overview

The custom fields extension is intended to be a javascript application that has hash-based routing and does not require a server to run. The sample application is based on Angular.

In order to register custom fields there are several conventions that **must** be met:
- The custom fields application must be compilable to javascript code, or must be javascript code, that can simply be executed from it's respective index.html file
- The custom fields application must be able to support hash routing and must have the following route `/#/fields`. Is is needed because the custom fields will be loaded in an iframe whose src will be `src="http://domain.com/sfextensions/custom-fields/#/fields?fieldName=Title&typeName=newsitems&fieldType=sf-short-text-default&sf-origin=http://domain.com"`, in this case this src tag is for a custom field that replaces the Title field, for the `newsitems` content type, etc.
- The custom fields application must be copied/output to the following directory `/dist/sfextensions/custom-fields` and the `custom-fields` folder must have in it's root the `index.html` file.
- The custom fields application must, in the case that the app that is being developed is not the provided Angular sample, which is already configured, the app must be able to resolve it's routing, if applicable, to mimic what is accomplished in the Angular application.
    - <base href="/sfextensions/custom-fields/"> in the index.html
    - equivalent, if applicable to Angular's `"deployUrl": "/sfextensions/custom-fields/"`, which does the following Customize the base path for the URLs of resources in 'index.html' and component stylesheets. This option is only necessary for specific deployment scenarios, such as with Angular Elements or when utilizing different CDN locations.
- The custom fields application, after it is built or copied in the output directory listed above, must have a file named fields.json

### Registering custom fields

Registering custom fields is done, in the `fields.json`. You have the ability rebind a field in the following combinations, rebind a field for:
The `fields.json` must be an array of objects, where a single object is 

```ts
Interface FieldRegistration {
    fieldName?: string,
    fieldType?: string,
    typeName?: string
}
```

There are 3 criteria the field's name fieldName the field's type fieldType and the content type typeName
- you can register a field by:
 - matching all 3
 - matching the fieldName and typeName
 - matching the fieldType and typeName
 - matching only the fieldName
 - matching only the fieldType

for example 

```json
[
  {
    "typeName": "newsitems",
    "fieldName": "relatedimage"
  },
  {
    "fieldName": "MetaTitle"
  },
  {
    "fieldName": "MetaDescription"
  },
  {
    "fieldName": "OpenGraphTitle"
  },
  {
    "fieldName": "OpenGraphDescription"
  },
  {
    "fieldName": "Title"
  }
]
```

### How custom fields work

Custom fields are external JavaScript applications that using a class that comes from our `@progress/sitefinity-adminapp-extensions-sdk` - `RpcChannel`.

#### RpcChannel Class in Sitefinity Decoupled Extensions

The RpcChannel class is a key part of creating decoupled extensions in Sitefinity. It allows for communication between a custom iframe and the Sitefinity backend using a Remote Procedure Call (RPC) model. This class enables you to call methods on the Sitefinity side, handle events, and respond to method calls from Sitefinity.

##### RpcChannel Overview

The RpcChannel facilitates secure cross-origin communication via the postMessage API, ensuring that only messages from the expected origin and window are processed. It uses RxJS to manage and filter messages, allowing for asynchronous communication with Sitefinity.

##### Key Features:
- **Method Call and Response:** The call method allows you to invoke remote methods and receive responses.
- **Service Proxies:** The getService method provides a proxy object for accessing remote services.
- **Event Handling:** The class includes methods to emit events and subscribe/unsubscribe to events from Sitefinity.
- **Security:** It validates the origin and source of messages to prevent unauthorized access.

##### Basic Usage

1. **Initializing RpcChannel**

To initialize the RpcChannel, you need to pass the parent window (typically window.parent in an iframe) and the origin of the Sitefinity admin app.

```ts
const parentWindow = window.parent;
const targetOrigin = new URL(document.referrer).origin; // Get Sitefinity's origin

// Create an instance of RpcChannel
const rpcChannel = new RpcChannel(parentWindow, targetOrigin);
```

2. **Calling a Remote Method**

You can use the call method to invoke a remote method on Sitefinity. This method returns a Promise that resolves with the result or rejects with an error.

```ts
rpcChannel.call('SitefinityService.writeValue', 'Some value')
    .then(response => console.log('Response from Sitefinity:', response))
    .catch(error => console.error('Error from Sitefinity:', error));
```

3. **Creating a Service Proxy**

The getService method creates a proxy object for the remote service. You can use this proxy to call the exposed methods on Sitefinity services without manually invoking call for each method.

```ts
const sitefinityService = rpcChannel.getService<ISitefinityService>('SitefinityService', ['writeValue', 'setErrors']);

// Call a method on the proxy service
sitefinityService.writeValue('Updated value')
    .then(() => console.log('Value updated successfully'))
    .catch(err => console.error('Failed to update value:', err));
```

4. **Handling Events**

You can subscribe to events using the on method, which allows you to handle custom events emitted from Sitefinity.

```ts
rpcChannel.on('customEvent', (payload) => {
    console.log('Custom event received:', payload);
});
```

To emit an event to Sitefinity:

```ts
rpcChannel.emit('customEvent', { key: 'value' });
```

5. **Unsubscribing from Events**

If you no longer want to listen for an event, you can unsubscribe using the off method:

```ts
rpcChannel.off('customEvent', eventHandler);
```

##### Example in Sitefinity

Here is an example of how the RpcChannel can be used in a Sitefinity decoupled extension to manage SEO-related fields:

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RpcChannel } from '@progress/sitefinity-adminapp-extensions-sdk';

@Component({
  selector: 'app-custom-seo-title',
  templateUrl: './custom-seo-title.component.html',
  styleUrls: ['./custom-seo-title.component.scss']
})
export class CustomSeoTitleComponent implements OnInit, OnDestroy {
  private rpcChannel!: RpcChannel;

  ngOnInit(): void {
    const parentWindow = window.parent;
    const targetOrigin = new URL(document.referrer).origin;

    // Instantiate the RPC channel
    this.rpcChannel = new RpcChannel(parentWindow, targetOrigin);

    // Subscribe to INIT event
    this.rpcChannel.on('INIT', (payload) => {
      console.log('Received INIT event:', payload);
    });
  }

  ngOnDestroy(): void {
    // Clean up event subscriptions
    this.rpcChannel.off('INIT', this.initEventHandler);
  }

  private initEventHandler(payload: any): void {
    console.log('Handling INIT event:', payload);
  }
}
```

##### Services available in the RPC  

`SitefinityService` can be used as strongly typed with `ISitefinityService` from `@progress/sitefinity-adminapp-extensions-sdk`, this service is responsible for calling the `writeValue` of the field. This is the mechanism to persist your data. The other method of this service is `setErrors`, it accepts an array of strings, where each string is a separate error, to reset the error for the field, call `setErrors(null)`. Please note that if there are errors set on the field, you will be block from completing a lifecycle/workflow operation, i.e. publishing or saving a draft.

`SitefinityRestService` can be used as strongly typed with `ISitefinityRestService` from `@progress/sitefinity-adminapp-extensions-sdk`, this service will enable you to make requests to Sitefinity's OData layer. This service will have the same access level as your current user, i.e. if the current user is an Editor, it will not have access to Administrator level endpoints.

In this example you can see an angular service, that is used to demonstrate how the custom fields can call a service in Sitefinity which returns data based on AI prompts, you can see how to use the rest SDK service, you must first configure it, i.e. for which culture, for which entity set (content type), and only then can you call an endpoint.

```ts
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
```

For more information please refer to the API documentation of `@progress/sitefinity-adminapp-extensions-sdk` [here](./api-docs/index.html).