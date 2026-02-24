const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// react-native-url-polyfill uses import.meta which Metro web doesn't support.
// Web already has URL natively, so we redirect to an empty shim on web.
const emptyShim = path.resolve(__dirname, "lib", "empty-polyfill.js");
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Redirect react-native-url-polyfill to empty shim on web
    if (platform === "web") {
        if (moduleName === "react-native-url-polyfill/auto" ||
            moduleName === "react-native-url-polyfill" ||
            moduleName === "react-native-url-polyfill/index" ||
            moduleName === "react-native-url-polyfill/js/URL" ||
            moduleName === "react-native-url-polyfill/js/URLSearchParams") {
            return {
                type: "sourceFile",
                filePath: emptyShim,
            };
        }
    }

    if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

// Add transformer to inject import.meta polyfill for web
const originalGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (entryPoints, options, getDependenciesOf) => {
    const transformOptions = originalGetTransformOptions
        ? await originalGetTransformOptions(entryPoints, options, getDependenciesOf)
        : {};

    return {
        ...transformOptions,
        transform: {
            ...transformOptions.transform,
            inlineRequires: false,
        },
    };
};

// Polyfill import.meta for web platform
if (config.transformer.babelTransformerPath) {
    const originalBabelTransformerPath = config.transformer.babelTransformerPath;
    config.transformer.babelTransformerPath = originalBabelTransformerPath;
}

module.exports = withNativeWind(config, { input: "./global.css" });
