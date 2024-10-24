import { Query, Sitefinity } from '@progress/sitefinity-webservices-sdk/dist/sitefinity-webservices-sdk';
import { error } from 'console';
import html2canvas from 'html2canvas';

export function takeScreenshot(): Promise<string> {
    return html2canvas(document.body as HTMLElement).then((canvas) => {
        const scaleFactor = 0.2;
        const scaledCanvas = document.createElement('canvas');
        const scaledCtx = scaledCanvas.getContext('2d');

        if (scaledCtx) {
            scaledCanvas.width = canvas.width * scaleFactor;
            scaledCanvas.height = canvas.height * scaleFactor;

            scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

            // Convert the scaled canvas to a base64 image
            return scaledCanvas.toDataURL('image/png');
        }

        return '';
    });
}

export function uploadScreenshot(base64: string, sf: Sitefinity, albumId: string) {
    return new Promise((resolve, reject) => {
        var data = sf.data({
            entitySet: "images"
        });

        const fileName = `screenshot${Date.now()}`;

        data.upload({
            data: {
                content: base64, /* images, documents or videos */
                contentType: "image/jpeg",
                name: `${fileName}.jpg`,
                payload: {
                },
                uploadProperties: {
                    ParentId: albumId,
                    Title: fileName,
                    UrlName: fileName
                }
            },
            successCb: data => resolve(data),
            failureCb: error => reject(error),
            publish: true
        });
    });
}

export function getFirstAlbumId(sf: Sitefinity) {
    return new Promise((resolve, reject) => {
        const data = sf.data({
            entitySet: "albums"
        });

        data.get({
            successCb: data => resolve(data),
            failureCb: error => reject(error)
        });
    });
}

