import React from 'react';

export const ResponsiveImage = ({
  responsiveImageData,
}: {
  responsiveImageData: string;
}) => {
  const imageFields = JSON.parse(responsiveImageData);
  return (
    <img
      src={imageFields.src}
      srcSet={imageFields.srcset || ''}
      sizes={imageFields.sizes || ''}
    />
  );
};
