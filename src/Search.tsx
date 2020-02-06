import React, { ChangeEvent } from 'react';
import {
  pluck,
  withLatestFrom,
  map,
  mapTo,
  scan,
  startWith,
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

  // Our first stream will map our text input value to what matches with items from our data
  const [handleSearchChange, search$] = useObservableCallback(
    (event$: Observable<ChangeEvent<HTMLInputElement>>) =>
      event$.pipe(
        // same as mapping to event.currentTarget.value
        pluck('currentTarget', 'value'),
        withLatestFrom(data$),
        map(([value, data]) => [
          value,
          data.filter(item => item.toLowerCase().includes(value.toLowerCase())),
        ]),
        // it is ok to use the initial value of the data prop here, it will only get
        // executed on first render
        startWith(['', data]),
        // personal preference but I always separate the command mapping
        map(([search, results]) => ({ search, results })),
      ),
  );

  // This is our second stream and will reset the search
  const [handleReset, reset$] = useObservableCallback(event$ =>
    event$.pipe(mapTo({ search: '' })),
  );

  // let's merge our two streams and generate our component state
  const { search, results } = useObservableState(
    merge(search$, reset$).pipe(
      scan(
        (state, command) => ({ ...state, ...command } as SearchState),
        defaultState,
      ),
    ),
    defaultState,
  );

  // Pass our handlers to their input fields so the observables can emit
  return (
    <>
      <input type="text" onChange={handleSearchChange} value={search} />
      <input type="button" value="Reset" onClick={handleReset} />
      <ul>
        {(search ? results : data).map(r => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  );
}
