import { processNavigationItems } from '../navigation';

test('processNavigationItems', () => {
  const result = processNavigationItems({
    allMdx: { distinct: [], group: [] },
  });
  expect(result).toEqual([]);
});
