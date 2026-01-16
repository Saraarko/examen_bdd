import { defineConfig } from '@prisma/config';

export default defineConfig({
    earlyAccess: true,
    schema: {
        kind: 'single',
        filePath: 'prisma/schema.prisma',
    },
    datasource: {
        provider: 'sqlite',
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    },
});
