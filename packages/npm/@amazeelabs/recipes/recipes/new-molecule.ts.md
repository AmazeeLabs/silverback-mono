# Molecule

> This recipe should be executed inside the package created by
> `amaazee-recipes add-storybook`.

```typescript
$$('ls src | grep elements');
```

Molecules are reusable React components that encapsulate recurring interface
elements and behaviours, but - in contrast to organisms - do not bind to a
specific business logic or data structure. In general, molecules emerge when
organisms happen to implement the same components over and over. Creating a
molecule before it's used in at least two organisms is considered premature
optimization.

First af all we have to choose a `CamelCased` name:

```typescript
const { MOLECULE } = $$.prompts({
  type: 'text',
  name: 'MOLECULE',
  message: 'Choose a name for this molecule:',
  validate: (name) =>
    !/^[A-Z][a-zA-Z]+$/.test(name)
      ? 'Molecule components names have to be CamelCased.'
      : true,
});
$$.vars({ MOLECULE });
```

Molecules contain two files, placed in any subdirectory of the
`src/elements/molecules` folder.

The main file is named after the molecule itself and contains all React
components and necessary helper functions and has to provide one default export
with the root molecule component.

```tsx
// |-> src/elements/molecules/MOLECULE.tsx
import React from 'react';

export default function MOLECULE(props: { content: string }) {
  return <div>{props.content}</div>;
}
```

To showcase and test the molecule, we create a `*.stories.ts` file that will
contain example content, behaviour and test specifications.

```typescript
// |-> src/elements/molecules/MOLECULE.stories.ts
import { Meta } from '@storybook/react';
import { MoleculeStory } from '@amazeelabs/react-framework-bridge/storybook';
import { within } from '@storybook/testing-library';

import MOLECULE from './MOLECULE';

export default {
  component: MOLECULE,
} as Meta;

export const ExampleMOLECULE: MoleculeStory<typeof MOLECULE> = {
  name: 'MOLECULE',
  args: {
    content: 'My awesome molecule.',
  },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await canvas.findByText('My awesome molecule.');
  },
};
```

Now we can just add the two new files to the repository and commit them.

```typescript
$$(`git add src/elements/molecules/${MOLECULE}.tsx`);
$$(`git add src/elements/molecules/${MOLECULE}.stories.ts`);
$$(`git commit -m "chore: scaffold ${MOLECULE} molecule"`);
```
