import { Link, PageProps } from 'gatsby';
import React from 'react';

import { GutenbergPageContext } from '../types/page-context';
import { Row } from '../util/Row';

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
            <div>{page.body}</div>
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
