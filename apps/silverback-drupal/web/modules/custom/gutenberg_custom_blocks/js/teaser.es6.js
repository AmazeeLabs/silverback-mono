const { blocks, blockEditor, data } = wp;
const { compose } = wp.compose;
const { withSelect } = data;
const { registerBlockType } = blocks;
const { InnerBlocks } = blockEditor;

const settings = {
  title: Drupal.t('Teaser'),
  icon: 'media-document',
  attributes: {},
  supports: {
    inserter: false,
    align: true,
    html: false,
  },

  edit(props) {
    return (
      <div className={props.className}>
        <InnerBlocks templateLock="all" template={[['core/paragraph', {}]]} />
      </div>
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

registerBlockType(`custom/teaser`, settings);
