import { ComponentStoryObj, DecoratorFn, Meta, Story } from '@storybook/react';
import { pick } from 'lodash';

import { Image, useImageContext } from './Image';

export default {
  component: Image,
} as Meta;

const Portrait = {
  original: await import(`../assets/portrait.jpg?metadata`),
  sizes: [
    await import('../assets/portrait.jpg?w=1000&webp&tint=aa0000&metadata'),
    await import('../assets/portrait.jpg?w=2000&webp&tint=00aa00&metadata'),
    await import('../assets/portrait.jpg?w=3000&webp&tint=0000aa&metadata'),
    await import('../assets/portrait.jpg?w=1000&tint=aa0000&metadata'),
    await import('../assets/portrait.jpg?w=2000&tint=00aa00&metadata'),
    await import('../assets/portrait.jpg?w=3000&tint=0000aa&metadata'),
  ],
};

const Landscape = {
  original: await import(`../assets/landscape.jpg?metadata`),
  sizes: [
    await import('../assets/landscape.jpg?w=1000&webp&tint=aa0000&metadata'),
    await import('../assets/landscape.jpg?w=2000&webp&tint=00aa00&metadata'),
    await import('../assets/landscape.jpg?w=3000&webp&tint=0000aa&metadata'),
    await import('../assets/landscape.jpg?w=1000&tint=aa0000&metadata'),
    await import('../assets/landscape.jpg?w=2000tint=00aa00&metadata'),
    await import('../assets/landscape.jpg?w=3000&tint=0000aa&metadata'),
  ],
};

const FluidContainer: DecoratorFn = (story) => (
  <div className="w-96 p-4 border-dotted border-2 border-gray-400">
    {story()}
  </div>
);

const FixedContainer: DecoratorFn = (story) => (
  <div className="w-96 h-32 p-4 border-dotted border-2 border-gray-400">
    {story()}
  </div>
);

const ConstrainedContainer: DecoratorFn = (story) => (
  <div className="max-w-[1000px]">{story()}</div>
);

export const Fluid: ComponentStoryObj<typeof Image> = {
  decorators: [FluidContainer],
  args: {
    ...pick(Landscape.original, ['width', 'height', 'src']),
    alt: 'How did the goat get up there?!?',
  },
};

export const FixedCover: ComponentStoryObj<typeof Image> = {
  decorators: [FixedContainer],
  args: {
    ...Fluid.args,
    layout: 'cover',
  },
};

export const FixedContain: ComponentStoryObj<typeof Image> = {
  decorators: [FixedContainer],
  args: {
    ...Fluid.args,
    layout: 'contain',
  },
};

export const Fallback: ComponentStoryObj<typeof Image> = {
  decorators: [FluidContainer],
  args: {
    ...Fluid.args,
    src: '/idontexist.jpg',
    alt: 'The goat is gone! Where is it?',
  },
};

export const FadeIn: ComponentStoryObj<typeof Image> = {
  decorators: [FluidContainer],
  args: {
    ...Fluid.args,
    className: 'transition-opacity duration-1000 opacity-0',
    readyClassName: 'opacity-100',
  },
};

export const CustomPlaceholder: Story = function Placeholder() {
  const { state } = useImageContext();
  if (state === 'loading') {
    return <p>🧘 Your image is being fetched.</p>;
  }
  if (state === 'error') {
    return <p>🤯 Your image could not be found.</p>;
  }
  return <></>;
};

export const UseCustomPlaceholder: ComponentStoryObj<typeof Image> = {
  decorators: [FluidContainer],
  args: {
    ...FadeIn.args,
    ...Fallback.args,
    children: <CustomPlaceholder />,
  },
};

export const Responsive: ComponentStoryObj<typeof Image> = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ...Fluid.args,
    srcSet: Landscape.sizes.map((size) => [size.src, size.width]),
  },
};

export const ResponsiveConstrained: ComponentStoryObj<typeof Image> = {
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [ConstrainedContainer],
  args: {
    ...Responsive.args,
    sizes: [['(min-width: 1000px)', '1000px']],
  },
};

export const ArtDirection: ComponentStoryObj<typeof Image> = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ...Fluid.args,
    sources: [
      {
        media: '(orientation: portrait)',
        srcSet: [[Portrait.original.src, Portrait.original.width]],
      },
    ],
  },
};

export const ArtDirectionConstrained: ComponentStoryObj<typeof Image> = {
  decorators: [ConstrainedContainer],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ...Fluid.args,
    sources: [
      {
        media: '(orientation: portrait)',
        srcSet: Portrait.sizes.map((size) => [size.src, size.width]),
      },
    ],
    srcSet: Landscape.sizes.map((size) => [size.src, size.width]),
    sizes: [['(min-width: 1000px)', '1000px']],
  },
};

export const LazyLoading: Story = () => (
  <div>
    <Image
      {...pick(Landscape.original, ['src', 'width', 'height'])}
      alt="How did the goat get up there?!?"
      lazy={false}
    />
    <div className="h-[2000px]">Now some space ...</div>
    <Image
      {...pick(Portrait.original, ['src', 'width', 'height'])}
      alt="Big goater is watching you ..."
    />
    <Image
      {...pick(Landscape.sizes[0], ['src', 'width', 'height'])}
      alt="How did the goat get so red?!?"
    />
  </div>
);
