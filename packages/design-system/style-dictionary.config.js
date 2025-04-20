import { formats, transformGroups } from "style-dictionary/enums";

const baseBuildPath = "src/dictionary";
const baseFileName = "styles";

export default {
  source: ["src/tokens.json"],
  platforms: {
    css: {
      buildPath: `${baseBuildPath}/`,
			transformGroup: transformGroups.css,
      files: [
        {
          destination: `${baseFileName}.css`,
          format: formats.cssVariables,
					options: {
						showFileHeader: true,
						outputReferences: true,
					},
        }
      ]
    },
    javascript: {
      buildPath: `${baseBuildPath}/`,
			transformGroup: transformGroups.js,
      files: [
        {
					destination: `${baseFileName}.js`,
          format: formats.javascriptEsm,
					options: {
						minify: true,
					}
        }
      ]
    }
  }
};
