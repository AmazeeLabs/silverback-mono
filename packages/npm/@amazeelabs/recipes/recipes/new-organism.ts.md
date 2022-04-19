# Organism

> This recipe should be executed inside the package created by
> `amaazee-recipes add-storybook`.

```typescript
$$('ls src | grep elements');
```

An Organism is a cohesive unit of an applications' user interface that can be
moved independently and implement its own behaviour. Whenever there are new
interface elements, an organism is the default starting point.

First af all we have to choose a `CamelCased` name:

```typescript
const { ORGANISM } = $$.prompts({
  type: 'text',
  name: 'ORGANISM',
  message: 'Choose a name for this organism:',
  validate: (name) =>
    !/^[A-Z][a-zA-Z]+$/.test(name)
      ? 'Organism components names have to be CamelCased.'
      : true,
});
$$.vars({ ORGANISM });
```

Organisms contain two files, placed in any subdirectory of the
`src/elements/organisms` folder.

The main file is named after the organism itself and contains all React
components and necessary helper functions and has to provide one default export
with the root organism component. To play nicely with the different frameworks
it could be used in, and organisms properties have to conform to the
`OrganismProps` definition, which only allows a limited set of property types.

```tsx
// |-> src/elements/organisms/ORGANISM.tsx
import { OrganismProps } from '@amazeelabs/react-framework-bridge';
import React from 'react';

export default function ORGANISM(props: OrganismProps<{ content: string }>) {
  return <div>{props.content}</div>;
}
```

To showcase and test the organism, we create a `*.stories.ts` file that will
contain example content, behaviour and test specifications.

```typescript
// |-> src/elements/organisms/ORGANISM.stories.ts
import { Meta } from '@storybook/react';
import { OrganismStory } from '@amazeelabs/react-framework-bridge/storybook';
import { within } from '@storybook/testing-library';

import ORGANISM from './ORGANISM';

export default {
  component: ORGANISM,
} as Meta;

export const ExampleORGANISM = {
  name: 'ORGANISM',
  args: {
    content: 'My awesome organism.',
  },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await canvas.findByText('My awesome organism.');
  },
};
```

Now we can just add the two new files to the repository and commit them.

```typescript
$$(`git add src/elements/organisms/${ORGANISM}.tsx`);
$$(`git add src/elements/organisms/${ORGANISM}.stories.ts`);
$$(`git commit -m "chore: scaffold ${ORGANISM} organism"`);
```
