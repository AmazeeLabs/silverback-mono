import { action } from '@storybook/addon-actions';
import { GatsbyLinkProps, navigate } from 'gatsby';
import { GatsbyImage, getSrc, StaticImage } from 'gatsby-plugin-image';
import React, { Component } from 'react';

import { DependencyProvider } from './dependencies';

const mockNavigate = ((to: string) => {
  action('navigate')(to);
  return new Promise<void>(() => {});
}) as typeof navigate;

// eslint-disable-next-line react/prefer-stateless-function
class MockLink extends Component<GatsbyLinkProps<any>> {
  render() {
    const { activeClassName, to, ...props } = this.props;
    return (
      <a
        {...props}
        href={this.props.to}
        className={
          this.props.to.includes('active')
            ? [this.props.className, this.props.activeClassName].join(' ')
            : this.props.className
        }
        onClick={(ev) => {
          ev.preventDefault();
          this.props.onClick
            ? this.props.onClick(ev)
            : mockNavigate(this.props.to);
        }}
      >
        {this.props.children}
      </a>
    );
  }
}

const MockStaticImage: typeof StaticImage = (props) => <img {...props} />;

const MockGatsbyImage: typeof GatsbyImage = ({ image, ...props }) => (
  <img src={getSrc(image)} {...props} />
);

export const decorators = [
  (story: Function, context: any) => (
    <DependencyProvider
      dependencies={{
        Link: MockLink,
        navigate: mockNavigate,
        StaticImage: MockStaticImage,
        GatsbyImage: MockGatsbyImage,
      }}
    >
      {story(context)}
    </DependencyProvider>
  ),
];
