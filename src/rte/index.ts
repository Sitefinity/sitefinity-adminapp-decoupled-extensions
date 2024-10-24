import { registerCustomTool, registerToolIcons, SfToolContext } from "@progress/sitefinity-adminapp-extensions-sdk";
import { Sitefinity } from "@progress/sitefinity-webservices-sdk/dist/sitefinity-webservices-sdk";
import { getFirstAlbumId, takeScreenshot } from "./screenshot";

function myCustomToolExec(e: Event, sfContext: SfToolContext) {
    if(e.preventDefault){
        e.preventDefault();
    }    

    const that = this;
    const sdk: Sitefinity = sfContext.restSdk;

    getFirstAlbumId(sdk).then((data: any) => {
        const firstAlbumId = data.value[0].Id;
        takeScreenshot().then((screenshot) => {
            that.exec("inserthtml", { value: `<img src="${screenshot}" alt="Screenshot" />` });
        });
    });
}

registerCustomTool("myCustomToolExec", myCustomToolExec);

registerToolIcons(() => {
    const kendo = (window as any).kendo || {};
    // this line sets the icon of the element if it's in the main toolbar
    kendo?.ui?.icon($('.k-button[title="My custom tool does some work"] .k-icon'), { icon: 'camera' });
    // this line sets the icon of the element if it's in the "more tools" dropdown
    kendo?.ui?.icon($("li.k-item.k-menu-item[title='My custom tool does some work'] span.k-icon"), { icon: 'camera' });
});
