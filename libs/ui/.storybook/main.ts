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
  addons: [...(rootMain.addons || []), '@nrwl/react/plugins/storybook'],
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
