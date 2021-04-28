module.exports = {
  plugins: [
    // Apply tailwind features.
    require('tailwindcss')(),
    // Add vendor prefixes.
    require('autoprefixer'),
  ],
};
