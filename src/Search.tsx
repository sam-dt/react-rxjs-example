import React, { ChangeEvent } from 'react';
import {
  pluck,
  withLatestFrom,
  map,
  scan,
  startWith,
  debounceTime,
  shareReplay,
} from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import {
  useObservable,
  pluckFirst,
  useObservableCallback,
  useObservableState,
} from 'observable-hooks';

interface SearchState {
  search: string;
  results: string[];
}

const defaultState: SearchState = {
  search: '',
  results: [],
};

interface Props {
  data: string[];
}

export default function Search({ data }: Props) {
  // Transform our prop to an observable
  // This way we can access it in our other observables and always use the
  // current value
  const data$ = useObservable(pluckFirst, [data]);

  // Our first stream will extract the value from the ChangeEvent
  const [handleSearchChange, search$] = useObservableCallback(
    (event$: Observable<ChangeEvent<HTMLInputElement>>) =>
      event$.pipe(
        // same as mapping to event.currentTarget.value
        pluck('currentTarget', 'value'),
        map(search => ({ search })),
      ),
  );

  // Our second stream will match the search value with items from our data array
  const results$ = useObservable(() =>
    search$.pipe(
      pluck('search'),
      debounceTime(300),
      withLatestFrom(data$),
      map(([search, data]) =>
        search
          ? data.filter(item =>
              item.toLowerCase().includes(search.toLowerCase()),
            )
          : data,
      ),
      // personal preference but I always separate the command mapping
      map(results => ({ results })),
    ),
  );

  // Our third stream will reset the search and results
  const [handleReset, reset$] = useObservableCallback(event$ =>
    event$.pipe(
      withLatestFrom(data$),
      map(([, data]) => ({ search: '', results: data })),
    ),
  );

  // let's merge our streams and generate our component state
  const { search, results } = useObservableState(
    merge(search$, results$, reset$).pipe(
      scan(
        // this will keep our state immutable
        (state, command) => ({ ...state, ...command } as SearchState),
        defaultState,
      ),
      // It's safe to use the data prop here as we only need its initial value
      startWith({ search: '', results: data }),
      shareReplay(1),
    ),
    defaultState,
  );

  // Pass our handlers to their input fields so the observables can emit
  return (
    <>
      <input type="text" onChange={handleSearchChange} value={search} />
      <input type="button" value="Reset" onClick={handleReset} />
      <ul>
        {results.map(r => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  );
}
