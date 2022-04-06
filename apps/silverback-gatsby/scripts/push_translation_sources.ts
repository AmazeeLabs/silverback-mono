import axios from 'axios';

const pushTranslationSources = async () => {
  if (
    !process.env.DRUPAL_BASE_URL ||
    !process.env.DRUPAL_CREATE_TRANSLATIONS_SOURCE_PATH ||
    !process.env.DRUPAL_USER_NAME ||
    !process.env.DRUPAL_USER_PASS
  ) {
    console.warn('Warning: Drupal env vars are not set.');
    return;
  }
  const url = `${process.env.DRUPAL_BASE_URL}${process.env.DRUPAL_CREATE_TRANSLATIONS_SOURCE_PATH}`;
  try {
    await axios.post(
      url,
      '{}',
      {
        auth: {
          username: process.env.DRUPAL_USER_NAME,
          password: process.env.DRUPAL_USER_PASS,
        }
      },
    ).then((response) => {
        console.log(response.data);
        return;
    });
  } catch (e) {
    console.warn(
      'Warning: Cannot call the create translations endpoint.',
      (e as any).toString(),
    );
    console.debug(e);
  }
}

pushTranslationSources();