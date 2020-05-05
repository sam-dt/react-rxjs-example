import { cold } from 'jest-marbles';
import { map } from 'rxjs/operators';

// import { scanToArray } from './src/SearchableList';
import { of } from 'rxjs';

describe('observable tests', () => {
  it('should correctly map values', () => {
    const values = {a: 1, b: 2, c: 2, d: 4};
    const base = cold('--a--b--', values);
    const expected = cold('--c--d--', values);
    expect(base.pipe(map(val => val * 2))).toBeObservable(expected);
  });

  // it('should keep emitted values in array', () => {
  // });

  // it('should filter empty values', () => {
  // });

});
