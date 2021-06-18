import Image from 'gatsby-image';
import React from 'react';

export const BlockTeaser: React.FC<BlockTeaserFragment> = ({
  image,
  title,
  subtitle,
  url,
}) => (
  <div className="border-solid border-4">
    <a href={url}>
      {image.translation?.localImage?.childImageSharp?.fixed && (
        <Image fixed={image.translation?.localImage.childImageSharp.fixed} />
      )}
      <h2>{title}</h2>
      <h4>{subtitle}</h4>
    </a>
  </div>
);
