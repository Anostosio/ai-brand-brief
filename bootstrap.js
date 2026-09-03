import { installLocalGenerationAdapter } from './local-generation-adapter.js';

installLocalGenerationAdapter(globalThis);
await import('./app.js');
