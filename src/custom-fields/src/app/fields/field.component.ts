import { Component } from "@angular/core";
import { CustomShortTextComponent } from "./short-text/custom-short-text.component";
import { ActivatedRoute } from "@angular/router";
import { WarningComponent } from "./warning/warning.component";
import { DefaultComponent } from "./default/default.component";
import { FIELD_QUERY_PARAMS, FieldTypes } from "@progress/sitefinity-adminapp-extensions-sdk";
import { NgComponentOutlet } from "@angular/common";
import { ImageComponent } from "./image/image.component";
import { CustomSeoTitleComponent } from "./custom-seo-title/custom-seo-title.component";
import { CustomSeoDescriptonComponent } from "./custom-seo-descripton/custom-seo-descripton.component";

@Component({
  selector: "field",
  templateUrl: "./field.component.html",
  standalone: true,
  imports: [NgComponentOutlet]
})
export class FieldComponent {

  constructor(private route: ActivatedRoute) {
  }

  getField() {
    const fieldName = this.route.snapshot.queryParamMap.get(FIELD_QUERY_PARAMS.FIELD_NAME);
    const fieldType = this.route.snapshot.queryParamMap.get(FIELD_QUERY_PARAMS.FIELD_TYPE);
    const typeName = this.route.snapshot.queryParamMap.get(FIELD_QUERY_PARAMS.TYPE_NAME);

    if (fieldName === "ss" && typeName === "newsitems") {
      return CustomShortTextComponent;
    }

    if (fieldName === "relatedimage" && typeName === "newsitems") {
      return ImageComponent;
    }

    if (fieldType === FieldTypes.number) {
      return WarningComponent;
    }

    if (fieldName === "Title" || fieldName === "OpenGraphTitle" || fieldName === "MetaTitle") {
      return CustomSeoTitleComponent;
    }

    if (fieldName === "OpenGraphDescription" || fieldName === "MetaDescription") {
      return CustomSeoDescriptonComponent;
    }

    return DefaultComponent;
  }
}
