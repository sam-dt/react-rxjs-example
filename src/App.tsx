import React from 'react';
import './App.css';
import Search from './Search';

const data = [
  'Lord of the Rings',
  'The Ring',
  'Ring of Fire',
  'Star Wars',
  'Star Trek',
  'From the Stars',
  'Black',
  'Black Beauty',
];

const App = () => {
  return (
    <div className="App">
      <Search data={data} />
    </div>
  );
};

export default App;
