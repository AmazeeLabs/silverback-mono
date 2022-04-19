# Layouts

> This recipe should be executed inside the package created by
> `amaazee-recipes add-storybook`.

```typescript
$$('ls src | grep elements');
```

First af all we have to choose a `CamelCased` name:

```typescript
const { LAYOUT } = $$.prompts({
  type: 'text',
  name: 'LAYOUT',
  message: 'Choose a name for this layout:',
  validate: (name) =>
    !/^[A-Z][a-zA-Z]+$/.test(name)
      ? 'Layout components names have to be CamelCased.'
      : true,
});
$$.vars({ LAYOUT });
```

A layout is a simple react component that defines a list of named slots that can
be filled with organisms. Their set of properties is tightly controlled by the
`LayoutProps` type, which takes a list of slot names that are rendered within a
JSX structure.

```tsx
// |-> src/elements/layouts/LAYOUT.tsx
import { LayoutProps } from '@amazeelabs/react-framework-bridge';
import React from 'react';

export default function LAYOUT(props: LayoutProps<'a' | 'b'>) {
  return (
    <div>
      <div>{props.a}</div>
      <div>{props.b}</div>
    </div>
  );
}
```

The `*.stories.ts` file makes use of helpers that allow us to easily show
placeholders within our layout component to test its appearance with different
sizes of content.

```typescript
// |-> src/elements/layouts/LAYOUT.stories.ts
import { LayoutStory } from '@amazeelabs/react-framework-bridge/storybook';
import { Meta } from '@storybook/react';

import LAYOUT from './LAYOUT';

export default {
  component: LAYOUT,
} as Meta;

export const Short: LayoutStory<typeof LAYOUT> = {
  args: {
    a: ['Slot A', 'yellow'],
    b: ['Slot B', 'purple'],
  },
};

export const Long: LayoutStory<typeof LAYOUT> = {
  args: {
    a: ['Slot A', 'yellow'],
    b: ['Slot B', 'purple', 1000],
  },
};
```

Now we can just add the two new files to the repository and commit them.

```typescript
$$(`git add src/elements/layouts/${LAYOUT}.tsx`);
$$(`git add src/elements/layouts/${LAYOUT}.stories.ts`);
$$(`git commit -m "chore: scaffold ${LAYOUT} layout"`);
```
