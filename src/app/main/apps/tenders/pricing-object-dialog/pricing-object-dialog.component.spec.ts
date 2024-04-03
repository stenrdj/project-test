import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingObjectDialogComponent } from './pricing-object-dialog.component';

describe('PricingObjectDialogComponent', () => {
  let component: PricingObjectDialogComponent;
  let fixture: ComponentFixture<PricingObjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PricingObjectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingObjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
