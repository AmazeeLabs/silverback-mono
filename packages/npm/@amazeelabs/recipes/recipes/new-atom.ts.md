# Atom

> This recipe should be executed inside the package created by
> `amaazee-recipes add-storybook`.

```typescript
$$('ls src | grep elements');
```

Atoms are simply CSS classes that are reused across multiple other components.
Since we use TailwindCSS, defining a new class is not a very common task. The
effort to name, document and maintain a CSS class should really be justified by
the need to enforce consistency und de-duplication of a lot of Tailwind class
applications. Very often the simple duplication of 3 Tailwind classes is the
more efficient solution that creating a new Atom everybody has to know and
understand.

If all of this has been considered, and we still want to create an Atom, we have
to choose a `CamelCased` name:

```typescript
const { ATOM } = $$.prompts({
  type: 'text',
  name: 'ATOM',
  message: 'Choose a name for this atom:',
  validate: (name) =>
    !/^[A-Z][a-zA-Z]+$/.test(name) ? 'Atom names have to be CamelCased.' : true,
});
$$.vars({ ATOM });
```

Every atom is defined in a `*.css` file within `src/elements/atoms`. The file
itself can contain any number of class definitions, which in turn can make use
of Tailwind `@apply`.

```css
/* |-> src/elements/atoms/ATOM.css */
.ATOM {
  @apply bg-black text-white p-2;
}
```

To test and document the atom, we add a `*.stories.mdx` file, that is picked up
by the Storybook [Docs](https://storybook.js.org/addons/@storybook/addon-docs)
addon.

```markdown
|-> src/elements/atoms/ATOM.stories.mdx

import { Meta, Canvas, Story } from '@storybook/addon-docs';

<Meta title="Elements/Atoms/ATOM" />

# ATOM

Describe what the atom does and under which circumstances it should be used. If
you can not come up with anything, it should probably not be an atom.

<Canvas>
  <Story name="ATOM">
    <div className="ATOM">Test</div>
  </Story>
</Canvas>
```

Now we can just add the two new files to the repository and commit them.

```typescript
$$(`git add src/elements/atoms/${ATOM}.css`);
$$(`git add src/elements/atoms/${ATOM}.stories.mdx`);
$$(`git commit -m "chore: scaffold ${ATOM} atom"`);
```
