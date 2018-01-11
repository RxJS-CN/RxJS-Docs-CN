import { SocialSharingComponent } from './social-sharing/social-sharing.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberComponent } from './member.component';
import { MaterialModule } from '../material/material.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MemberComponent', () => {
  let component: MemberComponent;
  let fixture: ComponentFixture<MemberComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MemberComponent],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberComponent);
    component = fixture.componentInstance;
    component.member = {
      name: 'ben lesh',
      role: 'lead',
      githubUrl: '',
      avatar: '',
      twitterUrl: '',
      webpageUrl: ''
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
