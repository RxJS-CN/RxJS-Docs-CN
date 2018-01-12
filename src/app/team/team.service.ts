import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

import { ITeam, IMember } from './team.models';

@Injectable()
export class TeamService {
  getTeam(): Observable<ITeam> {
    return Observable.from([
      {
        coreTeam: [
          {
            name: 'Ben Lesh',
            role: 'Developer',
            githubUrl: 'https://github.com/benlesh',
            avatar: 'https://avatars2.githubusercontent.com/u/1540597',
            twitterUrl: 'https://twitter.com/BenLesh',
            webpageUrl: 'http://www.benlesh.com'
          },
          {
            name: 'Paul Taylor',
            role: 'Developer',
            githubUrl: 'https://github.com/trxcllnt',
            avatar: 'https://avatars2.githubusercontent.com/u/178183',
            twitterUrl: 'https://twitter.com/trxcllnt',
            webpageUrl: 'http://graphistry.com'
          },
          {
            name: 'Matthew Podwysocki',
            role: 'Developer',
            githubUrl: 'https://github.com/mattpodwysocki',
            avatar: 'https://avatars0.githubusercontent.com/u/49051',
            twitterUrl: 'https://twitter.com/mattpodwysocki',
            webpageUrl: ''
          },
          {
            name: 'OJ Kwon',
            role: 'Developer',
            githubUrl: 'https://github.com/kwonoj',
            avatar: 'https://avatars1.githubusercontent.com/u/1210596',
            twitterUrl: 'https://twitter.com/_ojkwon',
            webpageUrl: ''
          },
          {
            name: 'André Staltz',
            role: 'Developer',
            githubUrl: 'https://github.com/staltz',
            avatar: 'https://avatars0.githubusercontent.com/u/90512',
            twitterUrl: 'https://twitter.com/andrestaltz',
            webpageUrl: 'http://staltz.com'
          },
          {
            name: 'David Driscoll',
            role: 'Developer',
            githubUrl: 'https://github.com/david-driscoll',
            avatar: 'https://avatars0.githubusercontent.com/u/1269157',
            twitterUrl: 'https://twitter.com/david_dotnet',
            webpageUrl: 'http://david-driscoll.github.io'
          },
          {
            name: 'Tracy Lee',
            role: 'Developer',
            githubUrl: 'https://github.com/ladyleet',
            avatar: 'https://avatars0.githubusercontent.com/u/8270563',
            twitterUrl: 'https://twitter.com/ladyleet',
            webpageUrl: 'http://thisdot.co'
          }
        ],
        learningTeam: [
          {
            name: 'Tracy Lee',
            role: 'Developer',
            githubUrl: 'https://github.com/ladyleet',
            avatar: 'https://avatars0.githubusercontent.com/u/8270563',
            twitterUrl: 'https://twitter.com/ladyleet',
            webpageUrl: 'http://thisdot.co'
          },
          {
            name: 'Ashwin Sureshkumar',
            role: 'Developer',
            githubUrl: 'https://github.com/ashwin-sureshkumar',
            avatar: 'https://avatars0.githubusercontent.com/u/4744080',
            twitterUrl: 'https://twitter.com/Sureshkumar_Ash',
            webpageUrl: 'https://t.co/XduklnxpK3'
          },
          {
            name: 'Brian Troncone',
            role: 'Developer',
            githubUrl: 'https://github.com/btroncone',
            avatar: 'https://avatars3.githubusercontent.com/u/5085101',
            twitterUrl: 'http://twitter.com/btroncone',
            webpageUrl: ''
          },
          {
            name: 'Sumit Arora',
            role: 'Developer',
            githubUrl: 'https://github.com/sumitarora',
            avatar: 'https://avatars3.githubusercontent.com/u/198247',
            twitterUrl: 'https://twitter.com/arorasumit',
            webpageUrl: 'http://www.arorasumit.com/'
          },
          {
            name: 'Jen Luker',
            role: 'Developer, A11y',
            githubUrl: 'https://github.com/knittingcodemonkey',
            avatar: 'https://avatars0.githubusercontent.com/u/1584489',
            twitterUrl: 'https://twitter.com/knitcodemonkey',
            webpageUrl: 'http://jenluker.com'
          }
        ]
      }
    ]);
  }
}
