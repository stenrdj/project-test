import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TendersAutocompleteComponent } from './tenders-autocomplete.component';

describe('TendersAutocompleteComponent', () => {
  let component: TendersAutocompleteComponent;
  let fixture: ComponentFixture<TendersAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TendersAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TendersAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
