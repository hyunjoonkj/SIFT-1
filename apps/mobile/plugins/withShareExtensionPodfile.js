const { withPodfile } = require('@expo/config-plugins');

const withShareExtensionPodfile = (config) => {
    return withPodfile(config, (config) => {
        const targetBlock = `
target 'ShareExtension' do
  use_expo_modules!
  config = use_native_modules!
  
  # Inherit search paths and configuration from the main project
  inherit! :complete
end
`;

        const contents = config.modResults.contents;
        // Regex to match existing ShareExtension target block (simple matching)
        const regex = /target 'ShareExtension' do[\s\S]*?end/g;

        if (regex.test(contents)) {
            config.modResults.contents = contents.replace(regex, targetBlock.trim());
        } else {
            config.modResults.contents += targetBlock;
        }

        return config;
    });
};

module.exports = withShareExtensionPodfile;
