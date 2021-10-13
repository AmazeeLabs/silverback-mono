/* global wp, Drupal */
const {
  blocks: { registerBlockType },
  blockEditor: { InnerBlocks },
} = wp;
const { t: __ } = Drupal;

const style = {
  minHeight: '40px',
  margin: '0 -40px',
  padding: '0 40px',
};

const settings = {
  title: __('Root'),
  icon: 'media-document',
  attributes: {},
  supports: {
    inserter: false,
    align: true,
    html: false,
  },

  edit() {
    return (
      <main style={style}>
        <InnerBlocks templateLock={false} template={[['core/paragraph', {}]]} />
      </main>
    );
  },

  save({ className }) {
    return (
      <main className={className}>
        <InnerBlocks.Content />
      </main>
    );
  },
};

registerBlockType(`custom/root`, settings);
