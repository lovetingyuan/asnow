import {
  update, render
} from '../lib'

test('correct export', () => {
  expect(typeof update).toBe('function')
  expect(typeof render).toBe('function')
})
