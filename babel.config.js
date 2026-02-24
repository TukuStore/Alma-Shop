module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", {
                jsxImportSource: "nativewind",
                unstable_transformImportMeta: true
            }],
            "nativewind/babel",
        ],
        plugins: [
            "react-native-reanimated/plugin",
            "babel-plugin-syntax-hermes-parser",
        ],
        env: {
            web: {
                plugins: [
                    // Handle import.meta by transforming it
                    'babel-plugin-transform-import-meta',
                ],
            },
        },
    };
};
