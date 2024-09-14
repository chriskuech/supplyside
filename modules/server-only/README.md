This module was forked from [`server-only`](https://www.npmjs.com/package/server-only?activeTab=code).

The module uses "conditional exports" to determine when the module is running in `react-server` or `node` environment (no op), or in `browser` environment (throws an error).

It was forked to add support for `node` environment, which is how `tsx` (seed scripts) are executed.
