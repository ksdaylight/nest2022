import { DataSource } from 'typeorm';

import { MigrationRunOptions } from '../types';

type HandlerOptions = MigrationRunOptions & { dataSource: DataSource };
export class TypeormMigrationRun {
    async handler({ transaction, fake, dataSource }: HandlerOptions) {
        const options = {
            transaction:
                dataSource.options.migrationsTransactionMode ?? ('all' as 'all' | 'none' | 'each'),
            fake,
        };
        switch (transaction) {
            case 'all':
                options.transaction = 'all';
                break;
            case 'none':
            case 'false':
                options.transaction = 'none';
                break;
            case 'each':
                options.transaction = 'each';
                break;
            default:
            // noop
        }
        //  console.log(JSON.stringify(options));
        const migrations = await dataSource.runMigrations(options);
        // console.dir(dataSource, { depth: 2 });
        console.log(
            `run options=> ${JSON.stringify(options)} migrations message(total : ${
                migrations.length
            }):\n`,
        );
        for (const migration of migrations) {
            console.log(`Migration ${migration.name} finished at ${migration.timestamp}`);
        }
    }
}
