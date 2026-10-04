import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260411_140744 from './20260411_140744';
import * as migration_20260530_231910_add_payload_plugins from './20260530_231910_add_payload_plugins';
import * as migration_20260531_010000_remove_multi_tenant from './20260531_010000_remove_multi_tenant';
import * as migration_20260531_020000_fix_locked_documents_tenant_fk from './20260531_020000_fix_locked_documents_tenant_fk';
import * as migration_20260531_021000_mcp_api_key_create_columns from './20260531_021000_mcp_api_key_create_columns';
import * as migration_20260531_030000_strip_tenant_fk_from_posts_projects from './20260531_030000_strip_tenant_fk_from_posts_projects';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260411_140744.up,
    down: migration_20260411_140744.down,
    name: '20260411_140744',
  },
  {
    up: migration_20260530_231910_add_payload_plugins.up,
    down: migration_20260530_231910_add_payload_plugins.down,
    name: '20260530_231910_add_payload_plugins',
  },
  {
    up: migration_20260531_010000_remove_multi_tenant.up,
    down: migration_20260531_010000_remove_multi_tenant.down,
    name: '20260531_010000_remove_multi_tenant',
  },
  {
    up: migration_20260531_020000_fix_locked_documents_tenant_fk.up,
    down: migration_20260531_020000_fix_locked_documents_tenant_fk.down,
    name: '20260531_020000_fix_locked_documents_tenant_fk',
  },
  {
    up: migration_20260531_021000_mcp_api_key_create_columns.up,
    down: migration_20260531_021000_mcp_api_key_create_columns.down,
    name: '20260531_021000_mcp_api_key_create_columns',
  },
  {
    up: migration_20260531_030000_strip_tenant_fk_from_posts_projects.up,
    down: migration_20260531_030000_strip_tenant_fk_from_posts_projects.down,
    name: '20260531_030000_strip_tenant_fk_from_posts_projects',
  },
];
