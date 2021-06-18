import Image from 'gatsby-image';
import React from 'react';

export const BlockImage: React.FC<BlockImageFragment> = ({
  caption,
  image,
}) => (
  <div className="border-solid border-4">
    {image.translation?.localImage?.childImageSharp?.fixed && (
      <Image fixed={image.translation?.localImage.childImageSharp.fixed} />
    )}
    <div>{caption}</div>
  </div>
);
