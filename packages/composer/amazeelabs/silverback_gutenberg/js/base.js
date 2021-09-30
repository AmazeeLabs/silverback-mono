var silverbackGutenbergUtils = {
  sanitizeText: function (text) {
    return (
      text
        // When copying text from Word, HTML comments are escaped. So we get this:
        // ...<br>&lt;!-- /* Font Definitions */ @font-face {...} --&gt;<br>...
        // Unescape them back.
        .replace('&lt;!--', '<!--')
        .replace('--&gt;', '-->')
        // Now clean all HTML tags.
        .replace(/(<([^>]+)>)/gi, '')
    );
  },

  setPlainTextAttribute: function (props, name, text) {
    const sanitizedText = silverbackGutenbergUtils.sanitizeText(text);
    props.setAttributes({
      [name]: sanitizedText,
    });
    if (text !== sanitizedText) {
      props.setState({ rerender: Date.now() });
    }
  },
};
