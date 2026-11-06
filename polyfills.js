// polyfills.js
// Import buffer polyfill for React Native
import { Buffer } from 'buffer';

// Make Buffer available globally
global.Buffer = Buffer;
