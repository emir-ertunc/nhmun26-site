import { useEffect, useRef, useState } from 'react'

type TurnstileStatus = 'loading' | 'ready' | 'error'

type TurnstileWidgetProps = {
  error?: string
  onError: () => void
  onExpire: () => void
  onVerify: (token: string) => void
  siteKey: string
}

type TurnstileApi = {
  remove: (widgetId: string) => void
  render: (
    container: HTMLElement,
    options: {
      callback: (token: string) => void
      'error-callback': () => void
      'expired-callback': () => void
      sitekey: string
      theme: 'light'
    },
  ) => string
  reset: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let turnstileScriptPromise: Promise<void> | null = null

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve()
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-script="true"]',
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Turnstile failed to load.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.dataset.turnstileScript = 'true'
    script.defer = true
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Turnstile failed to load.')),
      { once: true },
    )
    document.head.append(script)
  })

  return turnstileScriptPromise
}

export function TurnstileWidget({
  error,
  onError,
  onExpire,
  onVerify,
  siteKey,
}: TurnstileWidgetProps) {
  const [status, setStatus] = useState<TurnstileStatus>('loading')
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onErrorRef = useRef(onError)
  const onExpireRef = useRef(onExpire)
  const onVerifyRef = useRef(onVerify)

  useEffect(() => {
    onErrorRef.current = onError
    onExpireRef.current = onExpire
    onVerifyRef.current = onVerify
  }, [onError, onExpire, onVerify])

  useEffect(() => {
    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) {
          return
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          callback: (token) => {
            onVerifyRef.current(token)
          },
          'error-callback': () => {
            setStatus('error')
            onErrorRef.current()
          },
          'expired-callback': () => {
            onExpireRef.current()
          },
          sitekey: siteKey,
          theme: 'light',
        })
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error')
          onErrorRef.current()
        }
      })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [siteKey])

  return (
    <div className="rounded-lg border border-burgundy/15 bg-parchment/35 p-4">
      <div ref={containerRef} />
      {status === 'loading' && (
        <p className="text-sm font-semibold text-ink/64">
          Loading security check...
        </p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm font-semibold text-burgundy">
          Security check could not load. Refresh the page and try again.
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm font-semibold text-burgundy">{error}</p>
      )}
    </div>
  )
}
