import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSeoDescriptonComponent } from './custom-seo-descripton.component';

describe('CustomSeoDescriptonComponent', () => {
  let component: CustomSeoDescriptonComponent;
  let fixture: ComponentFixture<CustomSeoDescriptonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSeoDescriptonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSeoDescriptonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
