import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SfCommonModule } from '@progress/sitefinity-component-framework';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SfCommonModule],
  providers: [],
  templateUrl: './app.component.html'
})
export class AppComponent {
}
