import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'NextJob Extension',
    description: 'NextJob Browser Extension',
    version: '0.1.0',
    permissions: ['activeTab', 'storage'],
  },
});
