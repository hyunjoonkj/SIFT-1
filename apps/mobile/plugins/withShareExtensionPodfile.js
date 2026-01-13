const { withPodfile } = require('@expo/config-plugins');

const withShareExtensionPodfile = (config) => {
  return withPodfile(config, (config) => {
    const contents = config.modResults.contents;
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

    // Regex to match existing ShareExtension target block (simple matching)
    const regex = /target 'ShareExtension' do[\s\S]*?end/g;
    let newContents = contents;

    if (regex.test(contents)) {
      newContents = newContents.replace(regex, targetBlock.trim());
    } else {
      newContents += targetBlock;
    }

    // 2. Disable Privacy Manifest Aggregation (Fixes "Multiple commands produce" error)
    // Replace the line enabling aggregation with false using a flexible regex
    newContents = newContents.replace(
      /:privacy_file_aggregation_enabled\s*=>\s*.*?,/g,
      ':privacy_file_aggregation_enabled => false,'
    );

    // 3. Inject post_install hook to manually remove React-Core_privacy bundle if still present
    const postInstallHook = `
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )
    
    # Manually remove React-Core_privacy bundle to prevent duplicate output
    installer.pods_project.targets.each do |target|
      target.resource_bundles.each do |bundle_name, bundle_target|
         if bundle_name == 'React-Core_privacy'
           target.resource_bundles.delete(bundle_name)
         end
      end
    end
`;

    // Regex to match the standard react_native_post_install call
    const postInstallRegex = /react_native_post_install\([\s\S]*?\)/;

    if (postInstallRegex.test(newContents)) {
      newContents = newContents.replace(postInstallRegex, postInstallHook.trim());
    }

    config.modResults.contents = newContents;

    return config;
  });
};

module.exports = withShareExtensionPodfile;
