import { vi } from 'vitest'

// Chainable mock of the PostgREST query builder Supabase's client returns
// from `.from(...)`. Every filter/modifier method records its call and
// returns the same builder so tests can chain exactly like the real client;
// the builder is thenable so `await`-ing it (with or without `.single()`)
// resolves to whatever result the test configured.
const CHAIN_METHODS = [
  'select', 'insert', 'update', 'delete', 'upsert',
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'or',
  'order', 'range', 'limit', 'single', 'maybeSingle'
]

export function createQueryBuilder(result = { data: null, error: null }) {
  const calls = []
  const builder = { __calls: calls }

  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn((...args) => {
      calls.push([method, ...args])
      return builder
    })
  }

  builder.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)

  return builder
}

export function createStorageBucket({ getPublicUrl, upload, remove } = {}) {
  return {
    getPublicUrl: vi.fn(getPublicUrl || (path => ({ data: { publicUrl: `https://test.supabase.co/storage/${path}` } }))),
    upload: vi.fn(upload || (() => ({ error: null }))),
    remove: vi.fn(remove || (() => ({ error: null })))
  }
}
