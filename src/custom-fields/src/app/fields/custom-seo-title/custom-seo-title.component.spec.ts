import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSeoTitleComponent } from './custom-seo-title.component';

describe('CustomSeoTitleComponent', () => {
  let component: CustomSeoTitleComponent;
  let fixture: ComponentFixture<CustomSeoTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSeoTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSeoTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
