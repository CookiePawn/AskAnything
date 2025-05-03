const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
// SVG Transformer 설정을 추가합니다.
const svgConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // assetExts에서 svg를 제거하고 sourceExts에 svg를 추가합니다.
    assetExts: null, // 아래에서 재정의됨
    sourceExts: null, // 아래에서 재정의됨
  },
};

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const { 
    resolver: { sourceExts, assetExts }
  } = defaultConfig;

  // svgConfig와 defaultConfig를 병합합니다.
  svgConfig.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
  svgConfig.resolver.sourceExts = [...sourceExts, 'svg'];

  return mergeConfig(defaultConfig, svgConfig);
})();