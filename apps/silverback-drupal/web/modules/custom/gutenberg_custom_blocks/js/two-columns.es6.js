const { blocks, data, element, components, editor } = wp;
const { registerBlockType } = blocks;
const { dispatch, select } = data;
const { Fragment } = element;
const {
  PanelBody,
  BaseControl,
  Icon,
  RangeControl,
  IconButton,
  Toolbar,
  SelectControl,
  SVG,
  Path,
} = components;
const {
  InnerBlocks,
  RichText,
  InspectorControls,
  PanelColorSettings,
  MediaUpload,
  BlockControls,
} = editor;
const __ = Drupal.t;

const settings = {
  title: __('Two columns'),
  icon: (
    <SVG
      width="48"
      height="48"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H25V34H39ZM23 34H9V14H23V34Z"
      />
    </SVG>
  ),
  parent: ['custom/root'],

  edit(props) {
    return (
      <div className={props.className}>
        <InnerBlocks
          template={[
            [
              'core/columns',
              {},
              [
                ['core/column', {}],
                ['core/column', {}],
              ],
            ],
          ]}
          templateLock="insert"
        />
      </div>
    );
  },

  save() {
    return <InnerBlocks.Content />;
  },
};

registerBlockType(`custom/two-columns`, {
  ...settings,
});
