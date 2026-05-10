interface MigrationOptions {
    batchSize: number;
    incremental: boolean;
    dryRun: boolean;
}
interface MigrationResult {
    success: boolean;
    migrated: number;
    failed: string[];
    errors: string[];
    duration: number;
}
declare function migrate(options: MigrationOptions): Promise<MigrationResult>;
export { migrate, MigrationOptions, MigrationResult };
