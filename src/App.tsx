import React from 'react';
import './App.css';
import Search from './Search';
import { useObservableState } from 'observable-hooks';
import { fromFetch } from 'rxjs/fetch';
import { map, switchMap, startWith, catchError, delay } from 'rxjs/operators';
import { of } from 'rxjs';

interface User {
  name: string;
}

const App = () => {
  const search = useObservableState(
    fromFetch('https://jsonplaceholder.typicode.com/users').pipe(
      delay(1000),
      switchMap(response => response.json()),
      map((users: User[]) => users.map(user => user.name)),
      map(users => (<Search data={users} />)),
      startWith(<h2>Loading...</h2>),
      catchError(() => of(<h2>Error!</h2>))
    )
  );

  return (
    <div className="App">
      {search}
    </div>
  );
};

export default App;
