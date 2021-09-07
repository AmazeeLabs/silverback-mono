import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="items-start md:flex">
      <article className="w-full p-6 bg-white rounded-lg shadow-xl lg:p-8 xl:p-10 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none sm:max-w-none">
        <h1>The page was not found 🦍</h1>
      </article>
    </div>
  );
};

export default NotFound;
