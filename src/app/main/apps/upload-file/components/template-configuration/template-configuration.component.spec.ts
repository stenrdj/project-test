import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateConfigurationComponent } from './template-configuration.component';

describe('TemplateConfigurationComponent', () => {
  let component: TemplateConfigurationComponent;
  let fixture: ComponentFixture<TemplateConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
