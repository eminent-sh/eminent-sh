import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function runOptional(db: MigrateUpArgs['db'], query: ReturnType<typeof sql>) {
  try {
    await db.run(query)
  } catch {
    // Column, index, or table may already be absent on some environments.
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await runOptional(db, sql`DROP INDEX IF EXISTS \`media_tenant_idx\`;`)
  await runOptional(db, sql`ALTER TABLE \`media\` DROP COLUMN \`tenant_id\`;`)

  await runOptional(db, sql`DROP INDEX IF EXISTS \`posts_tenant_idx\`;`)
  await runOptional(db, sql`ALTER TABLE \`posts\` DROP COLUMN \`tenant_id\`;`)

  await runOptional(db, sql`DROP INDEX IF EXISTS \`_posts_v_version_version_tenant_idx\`;`)
  await runOptional(db, sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_tenant_id\`;`)

  await runOptional(db, sql`DROP INDEX IF EXISTS \`projects_tenant_idx\`;`)
  await runOptional(db, sql`ALTER TABLE \`projects\` DROP COLUMN \`tenant_id\`;`)

  await runOptional(db, sql`DROP INDEX IF EXISTS \`_projects_v_version_version_tenant_idx\`;`)
  await runOptional(db, sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_tenant_id\`;`)

  await runOptional(db, sql`DROP INDEX IF EXISTS \`categories_tenant_idx\`;`)
  await runOptional(db, sql`ALTER TABLE \`categories\` DROP COLUMN \`tenant_id\`;`)

  await runOptional(db, sql`DROP INDEX IF EXISTS \`tags_tenant_idx\`;`)
  await runOptional(db, sql`ALTER TABLE \`tags\` DROP COLUMN \`tenant_id\`;`)

  await runOptional(
    db,
    sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_tenants_id_idx\`;`,
  )

  await runOptional(db, sql`DROP TABLE IF EXISTS \`users_tenants\`;`)
  await runOptional(db, sql`DROP TABLE IF EXISTS \`tenants\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`tenants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`domain\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await runOptional(db, sql`CREATE UNIQUE INDEX IF NOT EXISTS \`tenants_slug_idx\` ON \`tenants\` (\`slug\`);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`tenants_updated_at_idx\` ON \`tenants\` (\`updated_at\`);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`tenants_created_at_idx\` ON \`tenants\` (\`created_at\`);`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`users_tenants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tenant_id\` integer NOT NULL,
  	FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`users_tenants_order_idx\` ON \`users_tenants\` (\`_order\`);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`users_tenants_parent_id_idx\` ON \`users_tenants\` (\`_parent_id\`);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`users_tenants_tenant_idx\` ON \`users_tenants\` (\`tenant_id\`);`)

  await runOptional(db, sql`ALTER TABLE \`media\` ADD \`tenant_id\` integer REFERENCES tenants(id);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`media_tenant_idx\` ON \`media\` (\`tenant_id\`);`)
  await runOptional(db, sql`ALTER TABLE \`posts\` ADD \`tenant_id\` integer REFERENCES tenants(id);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`posts_tenant_idx\` ON \`posts\` (\`tenant_id\`);`)
  await runOptional(db, sql`ALTER TABLE \`_posts_v\` ADD \`version_tenant_id\` integer REFERENCES tenants(id);`)
  await runOptional(
    db,
    sql`CREATE INDEX IF NOT EXISTS \`_posts_v_version_version_tenant_idx\` ON \`_posts_v\` (\`version_tenant_id\`);`,
  )
  await runOptional(db, sql`ALTER TABLE \`projects\` ADD \`tenant_id\` integer REFERENCES tenants(id);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`projects_tenant_idx\` ON \`projects\` (\`tenant_id\`);`)
  await runOptional(db, sql`ALTER TABLE \`_projects_v\` ADD \`version_tenant_id\` integer REFERENCES tenants(id);`)
  await runOptional(
    db,
    sql`CREATE INDEX IF NOT EXISTS \`_projects_v_version_version_tenant_idx\` ON \`_projects_v\` (\`version_tenant_id\`);`,
  )
  await runOptional(db, sql`ALTER TABLE \`categories\` ADD \`tenant_id\` integer REFERENCES tenants(id);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`categories_tenant_idx\` ON \`categories\` (\`tenant_id\`);`)
  await runOptional(db, sql`ALTER TABLE \`tags\` ADD \`tenant_id\` integer REFERENCES tenants(id);`)
  await runOptional(db, sql`CREATE INDEX IF NOT EXISTS \`tags_tenant_idx\` ON \`tags\` (\`tenant_id\`);`)
  await runOptional(
    db,
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`tenants_id\` integer REFERENCES tenants(id);`,
  )
  await runOptional(
    db,
    sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_tenants_id_idx\` ON \`payload_locked_documents_rels\` (\`tenants_id\`);`,
  )
}
