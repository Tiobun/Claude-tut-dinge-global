import { useEffect, useRef, useState } from 'react'
import { X, Copy, Check, Smartphone } from 'lucide-react'

/*
 * Doomscroll interceptor.
 *
 * An OS automation ("when Instagram is opened") opens this app at
 *   <PUBLIC_URL>#intercept-instagram
 * The app then runs "Decide for me" and offers the pick instead of the feed.
 *
 * The hash format is deliberately plain (#name, letters/digits/hyphens only)
 * so it survives hosts that strip query strings or complex fragments.
 */

// Where the app is hosted. Used to build the links shown in the setup guide.
export const PUBLIC_URL = 'https://claude.ai/artifact/8tSMSSxbgExeBLtTdebyet'

// Must match the grace period in the iOS Shortcut (see setup guide).
export const PASS_MINUTES = 10

const LOG_KEY = 'dopamine-intercepts-v1'
const MAX_LOG = 500

const APP_NAMES = {
  instagram: 'Instagram',
  reddit: 'Reddit',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  twitter: 'X',
  facebook: 'Facebook',
  threads: 'Threads',
  feed: 'the feed',
}

export const SETUP_APPS = ['instagram', 'reddit', 'tiktok', 'youtube', 'x']

/** Returns the app slug for "#intercept" / "#intercept-<app>", else null. */
export function parseIntercept(hash) {
  const m = /^#intercept(?:-([a-z0-9-]+))?$/i.exec(hash || '')
  return m ? (m[1] || 'feed').toLowerCase() : null
}

export function appLabel(slug) {
  return APP_NAMES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

/** Remove the hash so a reload doesn't re-trigger and the next open fires hashchange. */
export function clearHash() {
  try {
    history.replaceState(null, '', location.pathname + location.search)
  } catch {
    /* some hosts disallow it; harmless */
  }
}

/* ───────────── log: { t: epoch ms, app, outcome: 'pick' | 'scroll' | 'dismiss' } ───────────── */

export function loadLog() {
  try {
    const l = JSON.parse(localStorage.getItem(LOG_KEY))
    return Array.isArray(l) ? l : []
  } catch {
    return []
  }
}

export function appendLog(entry) {
  const next = [...loadLog(), entry].slice(-MAX_LOG)
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}

export function todayStats(log) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const todays = log.filter((e) => e.t >= start.getTime())
  return {
    total: todays.length,
    dodged: todays.filter((e) => e.outcome === 'pick').length,
  }
}

/* ───────────── Hold-to-confirm: friction on purpose ───────────── */

export function HoldButton({ label, ms = 3000, onComplete, disabled }) {
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)
  const start = useRef(0)

  const stop = () => {
    cancelAnimationFrame(raf.current)
    setProgress(0)
  }

  const tick = (now) => {
    const p = Math.min(1, (now - start.current) / ms)
    setProgress(p)
    if (p >= 1) {
      buzz(30)
      onComplete()
      return
    }
    raf.current = requestAnimationFrame(tick)
  }

  const begin = (e) => {
    if (disabled) return
    e.preventDefault()
    start.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const secondsLeft = Math.ceil(((1 - progress) * ms) / 1000)

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && begin(e)}
      onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && stop()}
      className="relative w-full select-none overflow-hidden rounded-2xl px-4 py-3 text-sm text-cream/45 ring-1 ring-chrome/10
                 transition hover:text-cream/60 disabled:opacity-40 [touch-action:none] [-webkit-touch-callout:none]"
    >
      <span
        className="absolute inset-y-0 left-0 bg-rust/30"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />
      <span className="relative">
        {progress > 0 ? `Keep holding… ${secondsLeft}` : label}
      </span>
    </button>
  )
}

/* ───────────── Setup guide ───────────── */

function CopyRow({ text }) {
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fall back: select the text so the user can copy it manually
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }
  return (
    <div className="flex items-center gap-2 rounded-xl bg-walnut-950/70 p-1.5 pl-3 ring-1 ring-chrome/15">
      <code ref={ref} className="min-w-0 flex-1 truncate text-xs text-teal-mist select-all">
        {text}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-cream/70 transition hover:bg-cream/10 active:scale-90"
      >
        {copied ? <Check className="h-4 w-4 text-teal-mist" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

const Step = ({ n, children }) => (
  <li className="flex gap-3">
    <span className="corduroy flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-walnut-950">
      {n}
    </span>
    <div className="min-w-0 flex-1 space-y-2 pt-0.5">{children}</div>
  </li>
)

const Act = ({ children }) => (
  <span className="rounded-md bg-cream/10 px-1.5 py-0.5 font-medium text-cream [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">{children}</span>
)

export function SetupSheet({ onClose, stats }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="setup-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-walnut-950/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg animate-rise px-3 pb-[max(env(safe-area-inset-bottom),12px)] sm:px-0 sm:pb-0">
        <div className="chrome rounded-[2rem] p-[2px]">
          <div className="walnut-panel relative max-h-[85dvh] overflow-y-auto rounded-[calc(2rem-2px)] px-5 py-6 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-cream/50 transition hover:bg-cream/10 hover:text-cream"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rust/15 text-[#e07a4a] ring-1 ring-rust/30">
                <Smartphone className="h-5 w-5" />
              </span>
              <div>
                <h2 id="setup-title" className="font-display text-2xl font-semibold text-cream">Doomscroll interceptor</h2>
                <p className="text-xs text-cream/50">
                  {stats.total > 0
                    ? `Today: ${stats.total} intercepted, ${stats.dodged} dodged`
                    : 'Opening a feed app opens this menu instead'}
                </p>
              </div>
            </div>

            <h3 className="mt-6 text-[11px] uppercase tracking-[0.25em] text-teal-mist/80">1 · The shortcut (once)</h3>
            <p className="mt-2 text-sm text-cream/60">
              In the <Act>Shortcuts</Act> app, create a new shortcut named <Act>Interceptor</Act>. It gives you a{' '}
              {PASS_MINUTES}-minute pass after each interception, so “scroll anyway” doesn’t loop.
            </p>
            <ol className="mt-4 space-y-4 text-sm leading-relaxed text-cream/75">
              <Step n="1">
                <p>
                  <Act>Get File</Act> from the Shortcuts folder, path <Act>interceptor.txt</Act>. Turn off{' '}
                  <Act>Error If Not Found</Act>.
                </p>
              </Step>
              <Step n="2">
                <p>
                  <Act>If</Act> File <Act>has any value</Act>:
                </p>
                <p className="text-cream/60">
                  inside it, add <Act>Get Time Between Dates</Act>: between <Act>File</Act> and <Act>Current Date</Act> in{' '}
                  <Act>Minutes</Act>. Then a nested <Act>If</Act> Time Between <Act>is less than</Act> {PASS_MINUTES} →{' '}
                  <Act>Stop This Shortcut</Act>.
                </p>
              </Step>
              <Step n="3">
                <p>
                  After the If blocks: <Act>Save File</Act> with <Act>Current Date</Act> to the Shortcuts folder as{' '}
                  <Act>interceptor.txt</Act>, with <Act>Overwrite If File Exists</Act> on.
                </p>
              </Step>
              <Step n="4">
                <p>
                  <Act>Open URLs</Act>: <Act>{PUBLIC_URL}#intercept-</Act> followed by the <Act>Shortcut Input</Act>{' '}
                  variable. Under the shortcut’s details, set it to receive <Act>Text</Act>.
                </p>
              </Step>
            </ol>

            <h3 className="mt-7 text-[11px] uppercase tracking-[0.25em] text-teal-mist/80">2 · One automation per app</h3>
            <ol className="mt-4 space-y-4 text-sm leading-relaxed text-cream/75">
              <Step n="1">
                <p>
                  <Act>Automation</Act> tab → <Act>+</Act> → <Act>App</Act> → pick Instagram → <Act>Is Opened</Act> →{' '}
                  <Act>Run Immediately</Act>.
                </p>
              </Step>
              <Step n="2">
                <p>
                  Action: <Act>Run Shortcut</Act> → <Act>Interceptor</Act>, with input text <Act>instagram</Act>.
                </p>
              </Step>
              <Step n="3">
                <p>Repeat for each app with its own word, so the stats show where you slip. Or test a link directly:</p>
                <div className="space-y-1.5">
                  {SETUP_APPS.map((a) => (
                    <CopyRow key={a} text={`${PUBLIC_URL}#intercept-${a}`} />
                  ))}
                </div>
              </Step>
            </ol>

            <h3 className="mt-7 text-[11px] uppercase tracking-[0.25em] text-teal-mist/80">Android (MacroDroid)</h3>
            <ol className="mt-4 space-y-4 text-sm leading-relaxed text-cream/75">
              <Step n="1">
                <p>
                  <Act>Variables</Act> → add a global <Act>Boolean</Act> named <Act>scroll_pass</Act>, value{' '}
                  <Act>false</Act>.
                </p>
              </Step>
              <Step n="2">
                <p>
                  New macro. Trigger: <Act>Applications</Act> → <Act>App Launched/Closed</Act> → <Act>Launched</Act>, then
                  pick your feed apps.
                </p>
              </Step>
              <Step n="3">
                <p>Actions, in this order:</p>
                <p className="text-cream/60">
                  <Act>Set Variable</Act> scroll_pass = true → <Act>Open Website</Act> with the link below →{' '}
                  <Act>Wait Before Next Action</Act> {PASS_MINUTES} min → <Act>Set Variable</Act> scroll_pass = false.
                </p>
              </Step>
              <Step n="4">
                <p>
                  Constraint: <Act>MacroDroid Variable</Act> scroll_pass <Act>is false</Act>. That’s the{' '}
                  {PASS_MINUTES}-minute pass.
                </p>
                <CopyRow text={`${PUBLIC_URL}#intercept-feed`} />
              </Step>
              <Step n="5">
                <p>
                  Allow the permissions MacroDroid asks for, and turn off battery optimization for it so it keeps running.
                </p>
              </Step>
            </ol>

            <p className="mt-6 rounded-xl bg-walnut-950/60 p-3 text-xs text-cream/50 ring-1 ring-chrome/10">
              The menu opens in Safari or the Claude app. Make sure you’re signed in to Claude there, then tap one of the
              links above once to check it lands on a pick.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Vibrate only after the user has interacted (browsers block it otherwise). */
export function buzz(ms) {
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
  navigator.vibrate?.(ms)
}
