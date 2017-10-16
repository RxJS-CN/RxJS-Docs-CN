import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

import { ITeam, IMember } from './team.models';

@Injectable()
export class TeamService {
  getTeam(): Observable<ITeam> {
    return Observable.from([{
      coreTeam: [{
        name: 'Fredrik Lundin',
        role: 'Developer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Fredrik is a fullstack developer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stockholm, Sweden'
      }, {
        name: 'Fredrik Lundin',
        role: 'Developer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Fredrik is a fullstack developer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stockholm, Sweden'
      },{
        name: 'Fredrik Lundin',
        role: 'Developer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Fredrik is a fullstack developer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stockholm, Sweden'
      },{
        name: 'Fredrik Lundin',
        role: 'Developer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Fredrik is a fullstack developer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stockholm, Sweden'
      },{
        name: 'Fredrik Lundin',
        role: 'Developer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Fredrik is a fullstack developer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stockholm, Sweden'
      }],
      learningTeam: [{
        name: 'Sunniva Grande',
        role: 'Designer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Sunniva is a UX designer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stavanger, Norway'
      }, {
        name: 'Sunniva Grande',
        role: 'Designer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Sunniva is a UX designer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stavanger, Norway'
      },{
        name: 'Sunniva Grande',
        role: 'Designer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Sunniva is a UX designer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stavanger, Norway'
      },{
        name: 'Sunniva Grande',
        role: 'Designer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Sunniva is a UX designer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stavanger, Norway'
      },{
        name: 'Sunniva Grande',
        role: 'Designer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Sunniva is a UX designer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stavanger, Norway'
      },{
        name: 'Sunniva Grande',
        role: 'Designer',
        githubUrl: 'https://github.com/fredrik-lundin',
        avatar: 'https://github.com/fredrik-lundin.png',
        twitterUrl: 'https://twitter.com/kirderflundin',
        linkedin: 'https://www.linkedin.com/in/lundin-fredrik',
        email: 'mailto:flu.lund@gmail.com',
        bio: 'Sunniva is a UX designer, during most of his daily work in the '
        + '.Net space. He is born and raised in Stavanger, Norway'
      }]
    }]);
  }
}
