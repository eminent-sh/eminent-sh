import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function runOptional(db: MigrateUpArgs['db'], query: ReturnType<typeof sql>) {
  try {
    await db.run(query)
  } catch {
    // Column may already exist.
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await runOptional(
    db,
    sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`categories_create\` integer DEFAULT false;`,
  )
  await runOptional(db, sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`tags_create\` integer DEFAULT false;`)
  await runOptional(db, sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`media_create\` integer DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await runOptional(db, sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`categories_create\`;`)
  await runOptional(db, sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`tags_create\`;`)
  await runOptional(db, sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`media_create\`;`)
}
