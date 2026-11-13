import { useCallback, useEffect, useRef, useState } from 'react'
import { Shuffle, RotateCcw, X, Play, Clock, Check, Dices, Smartphone } from 'lucide-react'
import { MENU, ITEM_BY_ID } from './menu.js'
import {
  parseIntercept, appLabel, clearHash, loadLog, appendLog, todayStats,
  HoldButton, SetupSheet, PASS_MINUTES, buzz,
} from './intercept.jsx'

const SPIN_MS = 1100
const STORAGE_KEY = 'dopamine-menu-v2'

/* ───────────────────────── helpers ───────────────────────── */

const today = () => new Date().toLocaleDateString('sv') // YYYY-MM-DD

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

/**
 * Roll 3–4 items per category.
 * Fresh items (not shown last time, not done today) come first, so a re-roll
 * always feels new. Already-seen items only fill in when the pool runs dry.
 */
function rollMenu(prev = {}, done = []) {
  const out = {}
  for (const cat of MENU) {
    const count = Math.min(cat.items.length, 3 + Math.round(Math.random()))
    const stale = new Set([...(prev[cat.id] ?? []), ...done])
    const fresh = shuffle(cat.items.filter((i) => !stale.has(i.id)))
    const seen = shuffle(cat.items.filter((i) => stale.has(i.id) && !done.includes(i.id)))
    const doneItems = shuffle(cat.items.filter((i) => done.includes(i.id)))
    out[cat.id] = [...fresh, ...seen, ...doneItems].slice(0, count).map((i) => i.id)
  }
  return out
}

// prefer what's on today's menu; fall back to anything not done yet, then anything
function interceptPool({ selection, done }) {
  const visibleOpen = MENU.flatMap((c) => selection[c.id]).filter((id) => !done.includes(id))
  if (visibleOpen.length) return visibleOpen
  const anyOpen = Object.keys(ITEM_BY_ID).filter((id) => !done.includes(id))
  return anyOpen.length ? anyOpen : Object.keys(ITEM_BY_ID)
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (s && s.date === today() && s.selection && Array.isArray(s.done)) {
      const valid = MENU.every((c) => s.selection[c.id]?.every((id) => ITEM_BY_ID[id]))
      if (valid) return s
    }
  } catch {
    /* storage unavailable: start fresh */
  }
  return { date: today(), selection: rollMenu(), done: [] }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

/* ───────────────────────── Header ───────────────────────── */

function Header({ onShuffle, doneCount, dodged }) {
  const [turn, setTurn] = useState(0)
  return (
    <header className="flex items-center gap-4 pt-8 pb-6">
      {/* space-age orbit ornament */}
      <span className="relative hidden h-10 w-10 shrink-0 rounded-full chrome-ring sm:block" aria-hidden="true">
        <span className="absolute inset-[30%] rounded-full bg-amber-glow shadow-[0_0_18px_4px_rgba(242,166,90,.55)] animate-glow" />
        <span className="absolute inset-0 rotate-[-25deg] scale-x-[1.7] scale-y-[.45] rounded-full border border-chrome/50" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-[0.3em] text-teal-mist/70">Daily</p>
        <h1 className="font-display text-[2rem] font-semibold leading-none tracking-tight text-cream sm:text-5xl">
          Dopamine <span className="italic font-normal text-amber-glow">Menu</span>
        </h1>
        <p className="mt-2 h-4 text-xs text-cream/45" aria-live="polite">
          {doneCount > 0 || dodged > 0
            ? [doneCount > 0 && `${doneCount} done`, dodged > 0 && `${dodged} scroll${dodged > 1 ? 's' : ''} dodged`]
                .filter(Boolean)
                .join(' · ') + ' today'
            : 'Pick one. That’s it.'}
        </p>
      </div>

      <div className="chrome shrink-0 rounded-full p-[2px] shadow-[0_8px_20px_-8px_rgba(0,0,0,.8)]">
        <button
          type="button"
          onClick={() => {
            setTurn((t) => t + 1)
            onShuffle()
          }}
          className="flex items-center gap-2 rounded-full bg-walnut-900 px-4 py-3 text-sm font-medium text-cream
                     transition hover:bg-walnut-800 active:scale-95"
        >
          <Shuffle
            className="h-4 w-4 text-amber-glow transition-transform duration-500"
            style={{ transform: `rotate(${turn * 180}deg)` }}
          />
          Shuffle <span className="hidden sm:inline">Menu</span>
        </button>
      </div>
    </header>
  )
}

/* ─────────────────────── Decide button ─────────────────────── */

function DecideButton({ onClick, busy, disabled }) {
  const [ripples, setRipples] = useState([])

  const handle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left
    const y = (e.clientY || rect.top + rect.height / 2) - rect.top
    setRipples((r) => [...r, { id, x, y }])
    setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 650)
    onClick()
  }

  return (
    <div className="chrome rounded-[2rem] p-[3px] shadow-[0_18px_40px_-12px_rgba(0,0,0,.7),0_0_60px_-10px_rgba(242,166,90,.35)]">
      <button
        type="button"
        onClick={handle}
        disabled={busy || disabled}
        className="corduroy group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[calc(2rem-3px)]
                   px-6 py-6 text-walnut-950 transition duration-150 ease-out
                   active:scale-[0.96] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:py-7"
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/40 animate-ripple"
            style={{ left: r.x, top: r.y }}
          />
        ))}
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-walnut-950/85 text-amber-glow shadow-inner transition-transform duration-500 group-hover:rotate-180">
          <Dices className={busy ? 'h-5 w-5 animate-orbit' : 'h-5 w-5'} strokeWidth={2.25} />
        </span>
        <span className="font-display text-2xl font-semibold tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,.25)] sm:text-3xl">
          {disabled ? 'All done. Shuffle for more' : 'Decide for me'}
        </span>
      </button>
    </div>
  )
}

/* ─────────────────────── Focus sheet ─────────────────────── */

function FocusSheet({ item, spinning, isDone, onClose, onLetsGo, onSpin, onDone, canSpin, intercept, pass, onScroll }) {
  const primaryRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    if (!spinning) primaryRef.current?.focus()
  }, [spinning])

  const Icon = pass ? Smartphone : item.icon
  const cat = item.category
  const eyebrow = spinning ? 'Shuffling…' : 'Your pick'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-walnut-950/75 backdrop-blur-sm animate-[rise_.3s_ease-out_both]"
      />

      <div className="relative w-full max-w-md animate-rise px-3 pb-[max(env(safe-area-inset-bottom),12px)] sm:px-0 sm:pb-0">
        <div className="chrome rounded-[2rem] p-[2px] shadow-[0_30px_80px_-20px_rgba(0,0,0,.9),0_0_80px_-20px_rgba(242,166,90,.45)]">
          <div className="walnut-panel relative overflow-hidden rounded-[calc(2rem-2px)] px-6 pt-6 pb-6 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-amber-glow/25 blur-3xl" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-cream/50 transition hover:bg-cream/10 hover:text-cream"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="relative text-xs font-medium uppercase tracking-[0.25em] text-teal-mist/80">
              {pass ? 'Your call' : intercept ? `Instead of ${appLabel(intercept)}…` : eyebrow}
            </p>

            <div
              key={pass ? 'pass' : spinning ? item.id : 'final'}
              className={`relative mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-3xl ring-1
                          ${pass ? 'bg-cream/5 text-cream/60 ring-chrome/20' : cat.accent}
                          ${spinning ? 'scale-95 opacity-80' : 'animate-rise'}`}
            >
              <Icon className="h-11 w-11" strokeWidth={1.75} />
            </div>

            <h2
              id="focus-title"
              aria-live="polite"
              className={`relative mt-5 font-display text-3xl font-semibold leading-tight text-cream transition-opacity
                          ${spinning ? 'opacity-60' : 'opacity-100'}`}
            >
              {pass ? 'Okay, go ahead.' : item.title}
            </h2>
            <p className="relative mt-1.5 text-cream/60">
              {pass
                ? `Reopen ${appLabel(pass)}. The next ${PASS_MINUTES} minutes are yours.`
                : item.detail}
            </p>

            {pass ? (
              <button
                ref={primaryRef}
                type="button"
                onClick={onClose}
                className="relative mt-7 w-full rounded-2xl bg-cream/10 px-5 py-4 font-semibold text-cream ring-1 ring-chrome/20 transition active:scale-95 hover:bg-cream/15"
              >
                Close
              </button>
            ) : (
            <>

            <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-walnut-950/60 px-3 py-1 text-xs text-cream/70 ring-1 ring-chrome/15">
              <cat.icon className="h-3.5 w-3.5" />
              {cat.name}
              <span className="text-cream/30">·</span>
              <Clock className="h-3.5 w-3.5" />
              {cat.time}
            </div>

            <div className="relative mt-7 grid grid-cols-[1fr_auto_auto] gap-3">
              <button
                ref={primaryRef}
                type="button"
                disabled={spinning}
                onClick={onLetsGo}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-glow px-5 py-4 font-semibold text-walnut-950
                           shadow-[0_8px_24px_-8px_rgba(242,166,90,.8)] transition active:scale-95 hover:bg-[#f6b673] disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-current" />
                Let’s go
              </button>
              <button
                type="button"
                disabled={spinning}
                onClick={onDone}
                aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
                aria-pressed={isDone}
                className={`flex items-center justify-center rounded-2xl px-4 py-4 ring-1 transition active:scale-95 disabled:opacity-50
                  ${isDone ? 'bg-teal-cord text-walnut-950 ring-teal-mist/40' : 'bg-cream/5 text-cream/80 ring-chrome/20 hover:bg-cream/10'}`}
              >
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                disabled={spinning || !canSpin}
                onClick={onSpin}
                aria-label="Pick again"
                className="flex items-center justify-center rounded-2xl bg-cream/5 px-4 py-4 text-cream/80 ring-1 ring-chrome/20
                           transition active:scale-95 hover:bg-cream/10 disabled:opacity-40"
              >
                <RotateCcw className={`h-5 w-5 ${spinning ? 'animate-orbit' : ''}`} />
              </button>
            </div>

            {intercept && (
              <div className="relative mt-4">
                <HoldButton
                  label={`Hold to open ${appLabel(intercept)} anyway`}
                  disabled={spinning}
                  onComplete={onScroll}
                />
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Menu ───────────────────────── */

function MenuItem({ item, accent, done, onToggle, delay }) {
  const Icon = done ? Check : item.icon
  return (
    <li className="animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={done}
        className={`group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition duration-300
                    hover:bg-cream/[0.06] active:scale-[0.98] ${done ? 'opacity-45' : ''}`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition duration-300
                      ${done ? 'bg-teal-cord/25 text-teal-mist ring-teal-cord/40' : `${accent} group-hover:scale-110 group-hover:shadow-[0_0_20px_-4px_currentColor]`}`}
        >
          <Icon className="h-5 w-5" strokeWidth={done ? 2.5 : 1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block font-medium text-cream decoration-teal-mist/70 decoration-2 transition-all duration-300
                        ${done ? 'line-through' : ''}`}
          >
            {item.title}
          </span>
          <span className="block truncate text-sm text-cream/50">{item.detail}</span>
        </span>
      </button>
    </li>
  )
}

function CategoryCard({ cat, ids, done, onToggle, roll }) {
  const CatIcon = cat.icon
  return (
    <section
      className="walnut-panel min-w-0 rounded-[1.75rem] p-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)]
                 ring-1 ring-chrome/10 transition duration-300 hover:ring-amber-glow/25
                 hover:shadow-[0_28px_50px_-20px_rgba(0,0,0,.9),0_0_40px_-15px_rgba(242,166,90,.35)]"
      aria-labelledby={`cat-${cat.id}`}
    >
      <div className="flex items-center gap-3 px-3 pt-3 pb-3">
        <span className="corduroy flex h-9 w-9 items-center justify-center rounded-full text-walnut-950 ring-2 ring-chrome/40">
          <CatIcon className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <h2 id={`cat-${cat.id}`} className="font-display text-2xl font-semibold text-cream">
          {cat.name}
        </h2>
        <span className="ml-auto text-right text-[11px] uppercase leading-tight tracking-widest text-teal-mist/70">
          {cat.tagline}
          <span className="block text-cream/40">{cat.time}</span>
        </span>
      </div>
      <div className="chrome mx-3 h-px opacity-40" />
      <ul className="py-1">
        {ids.map((id, i) => (
          <MenuItem
            key={`${roll}-${id}`}
            item={ITEM_BY_ID[id]}
            accent={cat.accent}
            done={done.includes(id)}
            onToggle={onToggle}
            delay={i * 50}
          />
        ))}
      </ul>
    </section>
  )
}

/* ───────────────────────── App ───────────────────────── */

export default function App() {
  const [state, setState] = useState(loadState)
  const [roll, setRoll] = useState(0)
  const [current, setCurrent] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [interceptApp, setInterceptApp] = useState(null)
  const [pass, setPass] = useState(null)
  const [log, setLog] = useState(loadLog)
  const [setupOpen, setSetupOpen] = useState(false)
  const timers = useRef([])
  const currentRef = useRef(null)
  currentRef.current = current

  useEffect(() => saveState(state), [state])

  const { selection, done } = state
  const visibleIds = MENU.flatMap((c) => selection[c.id])
  const openIds = visibleIds.filter((id) => !done.includes(id))

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const shuffleMenu = () => {
    setState((s) => ({ ...s, selection: rollMenu(s.selection, s.done) }))
    setRoll((r) => r + 1)
  }

  const toggleDone = useCallback((id) => {
    setState((s) => ({
      ...s,
      done: s.done.includes(id) ? s.done.filter((d) => d !== id) : [...s.done, id],
    }))
    buzz(10)
  }, [])

  // pick one of the given ids (default: displayed, unfinished items), slot-machine style
  const decide = useCallback((override) => {
    clearTimers()
    const ids = Array.isArray(override) ? override : openIds
    if (ids.length === 0) return
    const prev = currentRef.current?.id
    const pool = ids.length > 1 ? ids.filter((id) => id !== prev) : ids
    const final = ITEM_BY_ID[pick(pool)]

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || ids.length === 1) {
      setSpinning(false)
      setCurrent(final)
      return
    }

    setSpinning(true)
    setCurrent(ITEM_BY_ID[pick(ids)])
    let t = 0
    let delay = 60
    while (t + delay < SPIN_MS) {
      t += delay
      delay *= 1.18
      timers.current.push(setTimeout(() => setCurrent(ITEM_BY_ID[pick(ids)]), t))
    }
    timers.current.push(
      setTimeout(() => {
        setCurrent(final)
        setSpinning(false)
        buzz(18)
      }, SPIN_MS),
    )
  }, [openIds.join()])

  const close = useCallback(() => {
    clearTimers()
    setSpinning(false)
    setCurrent(null)
    setPass(null)
  }, [])

  useEffect(() => clearTimers, [])

  /* ── doomscroll interceptor ── */

  const endIntercept = (outcome) => {
    if (!interceptApp) return
    setLog(appendLog({ t: Date.now(), app: interceptApp, outcome }))
    setInterceptApp(null)
  }

  const decideRef = useRef(decide)
  decideRef.current = decide
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const handle = () => {
      const app = parseIntercept(location.hash)
      if (!app) return
      clearHash()
      setSetupOpen(false)
      setPass(null)
      setInterceptApp(app)
      decideRef.current(interceptPool(stateRef.current))
    }
    handle()
    window.addEventListener('hashchange', handle)
    return () => window.removeEventListener('hashchange', handle)
  }, [])

  const stats = todayStats(log)

  return (
    <div className="mx-auto min-h-[100dvh] max-w-5xl px-4 pb-16 sm:px-6">
      <Header onShuffle={shuffleMenu} doneCount={done.length} dodged={stats.dodged} />

      <div className="mx-auto max-w-md animate-rise">
        <DecideButton onClick={() => decide()} busy={spinning} disabled={openIds.length === 0} />
      </div>

      <div className="my-9 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-cream/30" aria-hidden="true">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-chrome/25" />
        or choose
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-chrome/25" />
      </div>

      <main className="grid items-start gap-5 md:grid-cols-2">
        {MENU.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            ids={selection[cat.id]}
            done={done}
            onToggle={toggleDone}
            roll={roll}
          />
        ))}
      </main>

      <footer className="mt-8 flex flex-col items-center gap-3 text-xs text-cream/30">
        <p>Tap an activity when you’ve done it.</p>
        <button
          type="button"
          onClick={() => setSetupOpen(true)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-cream/45 ring-1 ring-chrome/10 transition hover:bg-cream/5 hover:text-cream/70"
        >
          <Smartphone className="h-3.5 w-3.5" />
          Doomscroll interceptor
        </button>
      </footer>

      {current && (
        <FocusSheet
          item={current}
          spinning={spinning}
          isDone={done.includes(current.id)}
          canSpin={interceptApp ? true : openIds.length > 1}
          intercept={interceptApp}
          pass={pass}
          onClose={() => {
            endIntercept('dismiss')
            close()
          }}
          onLetsGo={() => {
            endIntercept('pick')
            close()
          }}
          onScroll={() => {
            const app = interceptApp
            endIntercept('scroll')
            setPass(app)
          }}
          onSpin={() => (interceptApp ? decide(interceptPool(state)) : decide())}
          onDone={() => {
            if (!done.includes(current.id)) {
              endIntercept('pick')
              toggleDone(current.id)
              close()
            } else toggleDone(current.id)
          }}
        />
      )}

      {setupOpen && <SetupSheet stats={stats} onClose={() => setSetupOpen(false)} />}
    </div>
  )
}
