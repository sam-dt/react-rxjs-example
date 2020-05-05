import React, { ChangeEvent } from 'react';
import {
  pluck,
  map,
  scan,
  startWith,
  debounceTime,
  filter,
  tap
} from 'rxjs/operators';
import { merge, Observable, combineLatest, EMPTY } from 'rxjs';
import {
  useObservable,
  pluckFirst,
  useObservableCallback,
  useObservableState,
} from 'observable-hooks';

interface SearchState {
  history: string[];
  filteredData: string[];
}

const defaultState: SearchState = {
  history: [],
  filteredData: [],
};

interface Props {
  data: string[];
}

const mapToTargetValue = (event$: Observable<ChangeEvent<HTMLInputElement>>) => event$.pipe(
  pluck('currentTarget', 'value'),
  debounceTime(500),
);

const scanToArray = (value$: Observable<string>) => value$.pipe(
  filter(val => Boolean(val)),
  scan((filters, filter) => [...filters, filter], [] as string[]),
);

export default function SearchableList({ data }: Props) {
  const data$ = useObservable(pluckFirst, [data]);
  const [handleChange, filter$] = useObservableCallback(mapToTargetValue);

  const filteredData$ = useObservable(() =>
    combineLatest(data$, filter$).pipe(
      map(([data, filter]) => data.filter(item => item.toLowerCase().includes(filter.toLowerCase()))),
      startWith(data),
      map(filteredData => ({ filteredData })),
    ));

  const history$ = useObservable(
    () => scanToArray(filter$).pipe(map(history => ({ history }))));

  const state$ = useObservable(
    () => merge(history$, filteredData$).pipe(
      scan((state, command) => ({ ...state, ...command }), defaultState)
    )
  );

  const { filteredData, history } = useObservableState(
    state$,
    defaultState
  );

  return (
    <div>
      <input type="text" onChange={handleChange} />
      <p>Past filters: {history.join(', ')}</p>
      <ul>
        {filteredData.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
