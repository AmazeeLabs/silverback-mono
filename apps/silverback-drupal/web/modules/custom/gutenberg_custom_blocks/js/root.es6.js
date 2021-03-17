const { blocks, blockEditor, data } = wp;
const { compose } = wp.compose;
const { withSelect } = data;
const { registerBlockType } = blocks;
const { InnerBlocks } = blockEditor;

const style = {
  minHeight: '40px',
  margin: '0 -40px',
  padding: '0 40px',
};

const settings = {
  title: Drupal.t('Root'),
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
