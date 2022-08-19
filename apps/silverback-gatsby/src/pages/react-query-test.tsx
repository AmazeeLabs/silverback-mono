import React, { useEffect, useState } from 'react';

import {
  useGetPagesQuery,
  useGetRandomIntMutation,
} from '../../generated/react-query';

const Sitemap: React.FC = () => {
  const [randomInt, setRandomInt] = useState<number>();
  const { data: pages } = useGetPagesQuery({ offset: 0, limit: 2 });
  const { mutate } = useGetRandomIntMutation({
    onSuccess: (data) => {
      setRandomInt(data.getRandomInt);
    },
  });
  useEffect(() => {
    const fetchRandomInt = () => mutate({ randomInt: 123 });
    fetchRandomInt();
    setInterval(fetchRandomInt, 1_000);
  }, []);
  return (
    <div>
      <h1>React Query test</h1>
      <div>
        Amount of loaded pages (should be 2):{' '}
        <span id="pages-count">{pages?.queryPages.length}</span>
      </div>
      <div>
        Loaded random int (should change):{' '}
        <span id="random-int">{randomInt}</span>
      </div>
    </div>
  );
};

export default Sitemap;
