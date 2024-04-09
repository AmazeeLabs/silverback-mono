import { TokenAuthBackend } from '@amazeelabs/decap-cms-backend-token-auth/backend';
import CMS from 'decap-cms-app';

CMS.registerBackend('token-auth', TokenAuthBackend);

CMS.init({
  config: {
    publish_mode: 'editorial_workflow',
    media_folder: 'media',
    backend: {
      // TODO: Patch decap types in '@amazeelabs/decap-cms-backend-token-auth'
      // @ts-expect-error: Decap types don't know 'token-auth'
      name: 'token-auth',
      api_root: '/.netlify/functions/github-proxy',
      repo: 'AmazeeLabs/decap-test',
      branch: 'main',
    },
    i18n: {
      structure: 'single_file',
      locales: ['en', 'de'],
      default_locale: 'en',
    },
    collections: [
      {
        label: 'Singleton',
        name: 'singleton',
        files: [
          {
            label: 'Global',
            name: 'global',
            file: 'global.yml',
            fields: [
              {
                label: 'Cool?',
                name: 'cool',
                widget: 'boolean',
              },
            ],
          },
        ],
      },
      {
        label: 'Untranslatable',
        name: 'untranslatable',
        i18n: false,
        create: true,
        folder: 'untranslatable',
        format: 'yml',
        identifier_field: 'title',
        summary: '{{title}}',
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'text',
          },
        ],
      },

      {
        label: 'Translatable',
        name: 'translatable',
        i18n: true,
        create: true,
        folder: 'translatable',
        format: 'yml',
        identifier_field: 'title',
        summary: '{{title}}',
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'text',
          },
        ],
      },
    ],
    load_config_file: false,
  },
});
