import { rootMain } from '../../../.storybook/main';
import type { StorybookConfig, Options } from '@storybook/core-common';

const config: StorybookConfig = {
  ...rootMain,

  core: { ...rootMain.core, builder: 'webpack5' },

  stories: [
    ...rootMain.stories,
    // '../src/theme/**/*.stories.mdx',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/theme/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    ...(rootMain.addons || []),
    // '@nrwl/react/plugins/storybook',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-styling',
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: true,
      },
    },
  ],
  webpackFinal: async (config, { configType }: Options) => {
    // apply any global webpack configs that might have been specified in .storybook/main.ts
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType } as Options);
    }

    // add your own webpack tweaks if needed

    return config;
  },
  staticDirs: ['../src/assets'],
};

module.exports = config;
