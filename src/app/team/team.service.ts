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
        'githubUrl': 'https://github.com/fredrik-lundin',
        'avatar': 'https://github.com/fredrik-lundin.png',
        'twitterUrl': 'https://twitter.com/kirderflundin',
        'linkedinUrl': 'https://www.linkedin.com/in/lundin-fredrik',
        'email': 'mailto:flu.lund@gmail.com',
        'bio':
          'Fredrik is a fullstack developer, during most of his daily work in the ' +
          '.Net space. He is born and raised in Stockholm, Sweden'
      },
      {
        'name': 'Jonas Lundin',
        'role': 'Bajskorv',
        'githubUrl': 'https://github.com/fredrik-lundin',
        'avatar':
          // tslint:disable-next-line:max-line-length
          'https://scontent.fSbma1-1.fna.fbcdn.net/v/t1.0-9/292966_10150978152096377_323051395_n.jpg?oh=830fed266e24bb5d4fccf082747d28fe&oe=5A6DA83C',
        'twitterUrl': 'https://twitter.com/kirderflundin',
        'linkedinUrl': 'https://www.linkedin.com/in/lundin-fredrik',
        'email': 'mailto:flu.lund@gmail.com',
        'bio': 'Gillar bajs etc etc etc '
      }],
      learningTeam: [{
        'name': 'Fredrik Lundin',
        'role': 'Developer',
        'githubUrl': 'https://github.com/fredrik-lundin',
        'avatar': 'https://github.com/fredrik-lundin.png',
        'twitterUrl': 'https://twitter.com/kirderflundin',
        'linkedinUrl': 'https://www.linkedin.com/in/lundin-fredrik',
        'email': 'mailto:flu.lund@gmail.com',
        'bio':
          'Fredrik is a fullstack developer, during most of his daily work in the ' +
          '.Net space. He is born and raised in Stockholm, Sweden'
      }]
    }]);
  }
}
