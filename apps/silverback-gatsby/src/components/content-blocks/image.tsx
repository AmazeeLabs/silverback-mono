import Image from 'gatsby-image';
import React from 'react';

export const BlockImage: React.FC<BlockImageFragment> = ({
  caption,
  image,
}) => (
  <div className="border-solid border-4">
    {image.localImage?.childImageSharp?.fixed && (
      <div>
        <Image fixed={image.localImage.childImageSharp.fixed} />
      </div>
    )}
    <div>{caption}</div>
  </div>
);
