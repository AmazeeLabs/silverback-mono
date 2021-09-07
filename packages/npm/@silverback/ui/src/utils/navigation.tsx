import _ from 'lodash';
import { useState } from 'react';

export const useMobileMenu = (): [boolean, () => void] => {
  const [status, set] = useState<boolean>(false);
  return [status, () => set(!status)];
};

export const useSubPageMenu = (
  size: number,
): [Record<number, boolean>, (index: number) => void, () => void] => {
  const initial = _.reduce(
    new Array(size),
    (acc, index) => _.merge(acc, { [index]: false }),
    {},
  );
  const [state, setState] = useState<Record<number, boolean>>(initial);
  const setActiveItem = (index: number) => {
    setState(_.merge({}, initial, { [index]: true }));
  };
  const close = () => {
    setState(_.merge({}, initial));
  };
  return [state, setActiveItem, close];
};
