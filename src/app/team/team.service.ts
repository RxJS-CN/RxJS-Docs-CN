import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

import { ITeam, IMember } from './team.models';

@Injectable()
export class TeamService {
  getTeam(): Observable<ITeam> {
    return Observable.from([{
      coreTeam: [{
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }, {
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }, {
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }, {
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }],
      learningTeam: [{
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }, {
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }, {
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }, {
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/benlesh',
        'avatar': 'https://github.com/benlesh.png',
        'twitterUrl': 'https://twitter.com/BenLesh',
        'linkedinUrl': 'https://www.linkedin.com/in/blesh/',
        'bio':
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Sed est odio, sodales et tellus a, semper pellentesque elit. ' +
          'Mauris purus dui, dignissim nec sodales ut, feugiat et purus.'
      }]
    }]);
  }
}
