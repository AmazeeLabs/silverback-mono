module.exports = {
  plugins: [
    // Transform @import rules by inlining content.
    require('postcss-import'),
    // Automatic prefixing and browser compatibility.
    require('postcss-preset-env')({ stage: 0 }),
    // Apply tailwind features.
    require('tailwindcss')(),
    // Strip CSS comments.
    require('postcss-discard-comments'),
    // Add vendor prefixes.
    require('autoprefixer'),
  ],
};
