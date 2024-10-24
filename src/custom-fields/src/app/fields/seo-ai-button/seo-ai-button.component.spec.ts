import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeoAiButtonComponent } from './seo-ai-button.component';

describe('SeoAiButtonComponent', () => {
  let component: SeoAiButtonComponent;
  let fixture: ComponentFixture<SeoAiButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeoAiButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeoAiButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
