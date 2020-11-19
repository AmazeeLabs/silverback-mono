// If you use Tailwind, this file and src/assets/tailwind.css are the two
// files you will mostly be editing to set your design values.
module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.ts', './src/**/*.tsx'],
  theme: {
    // https://tailwindcss.com/docs/customizing-colors
    colors: {
      amazee: {
        yellow: '#ffcc4f',
        gray: '#64675E',
        dark: '#2c3539',
        blue: '#60839b',
      },
      black: '#000',
      gray: {
        100: '#f0f0f0',
        200: '#ccc',
        300: '#aaa',
      },
      white: '#fff',
    },
    // By default, you get Tailwind's pre-packaged design values.
    // You can add a few values to those pre-defined values, by adding keys
    // beneath the "extend" key.
    // Alternatively, you can replace Tailwind's default values by specifying
    // keys outside of the "extend" key. For example, the "colors" key above
    // replaces all of Tailwind's default color names.
    extend: {
      // If necessary, adjust breakpoints.
      // https://tailwindcss.com/docs/breakpoints
      // If necessary, adjust spacing.
      // https://tailwindcss.com/docs/customizing-spacing
    },
  },
  variants: {
    // From https://tailwindcss.com/docs/configuring-variants/, here are all the
    // possible values that can be used in a variant's array:
    //   'responsive',
    //   'group-hover',
    //   'focus-within',
    //   'first',
    //   'last',
    //   'odd',
    //   'even',
    //   'hover',
    //   'focus',
    //   'active',
    //   'visited',
    //   'disabled',
    //
    width: ['responsive'],
    height: ['responsive'],
    margin: ['first', 'last', 'responsive'],
    borderWidth: ['first', 'last'],
    padding: ['first', 'last', 'responsive'],
    // backgroundColor: [],
    // textColor: [],
    //
    // For a full list of possible "variants" keys, see:
    // https://tailwindcss.com/docs/pseudo-class-variants/#default-variants-reference
  },
  plugins: [
    // Add custom plugins to implement dynamic utilities or components.
    // https://tailwindcss.com/docs/extracting-components#writing-a-component-plugin
    // https://tailwindcss.com/docs/adding-new-utilities#using-a-plugin
  ],
  future: {
    // Opt-in for future upcoming changes.
    // https://tailwindcss.com/docs/upcoming-changes
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
