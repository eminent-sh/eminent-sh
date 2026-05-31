import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260411_140744 from './20260411_140744';
import * as migration_20260530_231910_add_payload_plugins from './20260530_231910_add_payload_plugins';

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
    name: '20260530_231910_add_payload_plugins'
  },
];
