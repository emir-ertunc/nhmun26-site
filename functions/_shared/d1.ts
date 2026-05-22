export type D1Value = string | number | null

export type D1PreparedStatement = {
  all: <TRecord extends Record<string, unknown>>() => Promise<{
    results?: TRecord[]
  }>
  bind: (...values: D1Value[]) => D1PreparedStatement
  first: <TRecord extends Record<string, unknown>>() => Promise<TRecord | null>
  run: () => Promise<unknown>
}

export type D1Database = {
  prepare: (query: string) => D1PreparedStatement
}
