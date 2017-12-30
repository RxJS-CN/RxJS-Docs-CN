import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-social-sharing',
  templateUrl: './social-sharing.component.html',
  styleUrls: ['./social-sharing.component.scss']
})
export class SocialSharingComponent {
  @Input() githubUrl: string;
  @Input() twitterUrl: string;
  @Input() linkedinUrl: string;
}
