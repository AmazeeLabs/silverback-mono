const { blocks, blockEditor, data } = wp;
const { compose } = wp.compose;
const { withSelect } = data;
const { registerBlockType } = blocks;
const { InnerBlocks, __experimentalLinkControl } = blockEditor;
const LinkControl = __experimentalLinkControl;
const { DrupalMediaEntity } = DrupalGutenberg.Components;

const settings = {
  title: Drupal.t('Teaser'),
  icon: 'media-document',
  attributes: {
    mediaEntityIds: {
      type: 'array',
    },
    title: {
      type: 'string',
    },
    subtitle: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
  },
  supports: {
    inserter: true,
    align: false,
    html: false,
  },

  edit: (props) => {
    props.setAttributes({ mediaHtml: props.mediaHtml, ...props.attributes });
    return (
      <div className={props.className}>
        <DrupalMediaEntity
          attributes={props.attributes}
          setAttributes={props.setAttributes}
          isMediaLibraryEnabled={true}
          onError={(error) => {
            error = typeof error === 'string' ? error : error[2];
            dispatch('core/notices').createWarningNotice(error);
          }}
        />
        <RichText
          identifier="title"
          tagName="h2"
          value={props.attributes.title}
          multiline={false}
          allowedFormats={[]}
          placeholder={__('Title')}
          keepPlaceholderOnFocus={true}
          onChange={(title) => {
            props.setAttributes({
              title,
            });
          }}
        />
        <RichText
          identifier="subtitle"
          tagName="h4"
          value={props.attributes.subtitle}
          multiline={false}
          allowedFormats={[]}
          placeholder={__('Subtitle')}
          keepPlaceholderOnFocus={true}
          onChange={(subtitle) => {
            props.setAttributes({
              subtitle,
            });
          }}
        />
        <LinkControl
          placeholder={__('Link URL')}
          value={{ url: props.attributes.url }}
          settings={[]}
          onChange={(link) => {
            props.setAttributes({
              url: link.url,
            });
          }}
        />
      </div>
    );
  },

  save: (props) => {
    // TODO (gutenberg): display media on the node vew form. Probably: do not
    //  save data here, but render it with a twig template on Drupal side (this
    //  approach is called "dynamic" block).
    return (
      <div className={props.attributes.className}>
        <a href={props.attributes.url}>
          <h2>{props.attributes.title}</h2>
          <h4>{props.attributes.subtitle}</h4>
        </a>
      </div>
    );
  },
};

registerBlockType(`custom/teaser`, settings);
