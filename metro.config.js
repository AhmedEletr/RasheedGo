// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure resolver to handle buffer polyfill
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
};

module.exports = config;
