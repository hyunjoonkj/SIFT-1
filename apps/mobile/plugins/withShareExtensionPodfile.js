const { withPodfile } = require('@expo/config-plugins');

const withShareExtensionPodfile = (config) => {
    return withPodfile(config, (config) => {
        const targetBlock = `
target 'ShareExtension' do
  use_expo_modules!

  if ENV['EXPO_USE_COMMUNITY_AUTOLINKING'] == '1'
    config_command = ['node', '-e', "process.argv=['', '', 'config'];require('@react-native-community/cli').run()"];
  else
    config_command = [
      'node',
      '--no-warnings',
      '--eval',
      'require(\\'expo/bin/autolinking\\')',
      'expo-modules-autolinking',
      'react-native-config',
      '--json',
      '--platform',
      'ios'
    ]
  end

  config = use_native_modules!(config_command)
  
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
