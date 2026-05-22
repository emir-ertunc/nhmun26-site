export const jsonHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: jsonHeaders,
    status,
  })
}

export function errorResponse(status: number, code: string, message: string) {
  return jsonResponse(
    {
      error: {
        code,
        message,
      },
      ok: false,
    },
    status,
  )
}
