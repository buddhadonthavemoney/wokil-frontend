import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'http://localhost:8090/api-docs/openapi.yaml',
    output: {
        path: 'src/generated/wokil-api',
    },
    plugins: [
        {
            name: '@hey-api/client-fetch',
            runtimeConfigPath: './src/lib/api-client',
        },
        '@hey-api/typescript',
        {
            name: '@hey-api/sdk',
            validator: false,
        },
        'zod',
        {
            name: '@tanstack/react-query',
            queryOptions: true,
            mutationOptions: true,
        },
    ],
});
