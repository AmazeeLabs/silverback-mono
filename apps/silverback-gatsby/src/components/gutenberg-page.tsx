import { Link, PageProps } from 'gatsby';
import React from 'react';

import { GutenbergPageContext } from '../types/page-context';
import { Row } from '../util/Row';
import { UnreachableCaseError } from '../util/types';
import { BlockHtml } from './content-blocks/html';
import { BlockImage } from './content-blocks/image';
import { BlockTwoColumns } from './content-blocks/two-columns';

const GutenbergPage: React.FC<PageProps> = ({ pageContext }) => {
  const { page, otherLanguages } = pageContext as GutenbergPageContext;

  return (
    <>
      <Link to="/">To frontpage</Link>
      <table>
        <tr>
          <Row>Title</Row>
          <Row>Body</Row>
          <Row>Other languages</Row>
        </tr>
        <tr>
          <Row>{page.title}</Row>
          <Row>
            {page.body.map((block) => {
              switch (block.__typename) {
                case 'DrupalBlockHtml':
                  return <BlockHtml {...block} />;
                case 'DrupalBlockImage':
                  return <BlockImage {...block} />;
                case 'DrupalBlockTwoColumns':
                  return <BlockTwoColumns {...block} />;
                default:
                  throw new UnreachableCaseError(block);
              }
            })}
          </Row>
          <Row>
            <ul>
              {otherLanguages.map((other) => (
                <li key={`language-link-${other.language.id}`}>
                  <Link to={other.path}>{other.language.name}</Link>
                </li>
              ))}
            </ul>
          </Row>
        </tr>
      </table>
    </>
  );
};

export default GutenbergPage;
