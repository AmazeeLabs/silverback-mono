import { Element } from 'domhandler';
import Image, { GatsbyImageProps } from 'gatsby-image';
// TODO: if it's going to be a separate package: move html-react-parser from the
//  to the project to the package.
import parse from 'html-react-parser';
import React from 'react';

export interface ImageSet {
  url: string;
  props: GatsbyImageProps;
}

export const renderHtml = (html: string, imageSets: ImageSet[]) => {
  return parse(html, {
    replace: (node) => {
      if (node instanceof Element && node.tagName === 'img') {
        const imageSet = imageSets.find((it) => it.url === node.attribs.src);
        if (imageSet) {
          return (
            <Image
              alt={node.attribs.alt}
              title={node.attribs.title}
              {...imageSet.props}
            />
          );
        }
      }
    },
  });
};
