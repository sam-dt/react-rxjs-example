import React from 'react';
import './App.css';
import SearchableList from './SearchableList';
import { useObservableState } from 'observable-hooks';
import { fromFetch } from 'rxjs/fetch';
import {
  map,
  switchMap,
  startWith,
  catchError,
  delay,
  retry,
  tap,
} from 'rxjs/operators';
import { of, never } from 'rxjs';

interface User {
  name: string;
}

const url = 'https://jsonplaceholder.typicode.com/users';

const fetch$ = fromFetch(url).pipe(
  delay(1000),
  tap(() => {
    if (Math.random() > 0.5) {
      throw new Error('oops');
    }
  }),
  switchMap(response => response.json()),
  map((users: User[]) => users.map(user => user.name)),
  map(users => <SearchableList data={users} />),
  startWith(<h2>Loading...</h2>),
  retry(2),
  catchError(error => of(<h2>Failed to fetch: {error.message}</h2>))
);

const App = () => {
  const userList = useObservableState(fetch$);

  return (
    <div className="App">
      {userList}
    </div>
  );
};

export default App;
