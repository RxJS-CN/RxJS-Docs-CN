import { OperatorDoc } from "../operator.model";

export const groupBy: OperatorDoc = {
  name: "groupBy",
  operatorType: "transformation",
  signature: `
    public groupBy(keySelector: (value: T) => K,
                   elementSelector?: ((value: T) => R) | void,
                   durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>,
                   subjectSelector?: () => Subject<R>)
          : Observable<any>): OperatorFunction<T, GroupedObservable<K, R>>`,
  parameters: [
    {
      name: "keySelector",
      type: "(value: T) => K",
      attribute: "",
      description: `A function that extracts the key used for grouping for each item.`
    },
    {
      name: "elementSelector",
      type: "((value: T) => R) | void",
      attribute: "optional",
      description: `A function that extracts the emitted element for each item. Default is identity function.`
    },
    {
      name: "durationSelector",
      type: "(grouped: GroupedObservable<K, R>) => Observable<any>",
      attribute: "optional",
      description: `A function that returns an Observable to determine how long each group should exist.`
    },
    {
      name: "subjectSelector",
      type: "() => Subject<R>",
      attribute: "optional",
      description: ``
    }
  ],
  marbleUrl: "http://reactivex.io/rxjs/img/groupBy.png",
  shortDescription: {
    description: `
      Group, according to a specified key, elements from items emitted by an Observable,
      and emit these grouped items as GroupedObservables, one GroupedObservable per group.
    `,
    extras: []
  },
  walkthrough: {
    description: `
    <p>When the Observable emits an item, a key is computed for this item with the keySelector function.</p>

    <p>If a GroupedObservable for this key exists, this GroupedObservable emits. Elsewhere, a new
    GroupedObservable for this key is created and emits.</p>

    <p>A GroupedObservable represents values belonging to the same group represented by a common key.
    The common key is available as the key field of a GroupedObservable instance.</p>

    <p>The elements emitted by GroupedObservables are by default the items emitted by the Observable,
    or elements returned by the elementSelector function.
    `
  },
  examples: [
    {
      name: "Group objects by id and return as array",
      code: `
        interface Obj {
          id: number;
          name: string;
        }
        Rx.Observable.of<Obj>({id: 1, name: 'aze1'},
                              {id: 2, name: 'sf2'},
                              {id: 2, name: 'dg2'},
                              {id: 1, name: 'erg1'},
                              {id: 1, name: 'df1'},
                              {id: 2, name: 'sfqfb2'},
                              {id: 3, name: 'qfs3'},
                              {id: 2, name: 'qsgqsfg2'})
          .groupBy(p => p.id)
          .flatMap( (group$) => group$.reduce((acc, cur) => [...acc, cur], []))
          .subscribe(p => console.log(p));
        /*
          Output:
          [ { id: 1, name: 'aze1' },
            { id: 1, name: 'erg1' },
            { id: 1, name: 'df1' } ]

          [ { id: 2, name: 'sf2' },
            { id: 2, name: 'dg2' },
            { id: 2, name: 'sfqfb2' },
            { id: 2, name: 'qsgqsfg2' } ]

          [ { id: 3, name: 'qfs3' } ]
        */
        `,
      externalLink: {
        platform: "JSBin",
        url: "http://jsbin.com/linekelumo/1/embed?js,console"
      }
    },
    {
      name: "Pivot data on the id field",
      code: `
      interface Obj {
        id: number;
        name: string;
      }
      Rx.Observable.of<Obj>({id: 1, name: 'aze1'},
                            {id: 2, name: 'sf2'},
                            {id: 2, name: 'dg2'},
                            {id: 1, name: 'erg1'},
                            {id: 1, name: 'df1'},
                            {id: 2, name: 'sfqfb2'},
                            {id: 3, name: 'qfs1'},
                            {id: 2, name: 'qsgqsfg2'})
        .groupBy(p => p.id, p => p.name)
        .flatMap( (group$) => group$.reduce((acc, cur) => [...acc, cur], ["" + group$.key]))
        .map(arr => ({'id': parseInt(arr[0]), 'values': arr.slice(1)}))
        .subscribe(p => console.log(p));
      /*
        Output:
        { id: 1, values: [ 'aze1', 'erg1', 'df1' ] }

        { id: 2, values: [ 'sf2', 'dg2', 'sfqfb2', 'qsgqsfg2' ] }

        { id: 3, values: [ 'qfs1' ] }
      */
        `,
      externalLink: {
        platform: "JSBin",
        url: "http://jsbin.com/racikizeji/embed?js,console"
      }
    }
  ],
  relatedOperators: [],
  additionalResources: []
};
