import { useCallback, useEffect, useRef, useState } from 'react'
import { Shuffle, RotateCcw, X, Play, Clock } from 'lucide-react'
import { MENU, ALL_ITEMS } from './menu.js'

const SPIN_MS = 1100

function pickRandom(exclude) {
  const pool = ALL_ITEMS.filter((i) => i.title !== exclude?.title)
  return pool[Math.floor(Math.random() * pool.length)]
}

/* ───────────────────────── Header ───────────────────────── */

function Header() {
  return (
    <header className="pt-10 pb-6 text-center">
      {/* space-age orbit ornament */}
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center" aria-hidden="true">
        <span className="relative block h-10 w-10 rounded-full chrome-ring">
          <span className="absolute inset-[30%] rounded-full bg-amber-glow shadow-[0_0_18px_4px_rgba(242,166,90,.55)] animate-glow" />
          <span className="absolute inset-0 rotate-[-25deg] scale-x-[1.7] scale-y-[.45] rounded-full border border-chrome/50" />
        </span>
      </div>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-cream sm:text-5xl">
        Dopamine <span className="italic font-normal text-amber-glow">Menu</span>
      </h1>
      <p className="mt-2 text-sm tracking-[0.2em] uppercase text-teal-mist/70">Pick one. That’s it.</p>
    </header>
  )
}

/* ─────────────────────── Randomizer ─────────────────────── */

function DecideButton({ onClick, busy }) {
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
        disabled={busy}
        className="corduroy group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[calc(2rem-3px)]
                   px-6 py-6 text-walnut-950 transition-transform duration-150 ease-out
                   active:scale-[0.96] hover:brightness-110 disabled:cursor-wait sm:py-7"
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/40 animate-ripple"
            style={{ left: r.x, top: r.y }}
          />
        ))}
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-walnut-950/85 text-amber-glow shadow-inner transition-transform duration-500 group-hover:rotate-180">
          <Shuffle className={busy ? 'h-5 w-5 animate-orbit' : 'h-5 w-5'} strokeWidth={2.25} />
        </span>
        <span className="font-display text-2xl font-semibold tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,.25)] sm:text-3xl">
          I can’t decide
        </span>
      </button>
    </div>
  )
}

/* ─────────────────────── Focus sheet ─────────────────────── */

function FocusSheet({ item, spinning, fromRandom, onClose, onSpin }) {
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

  const Icon = item.icon
  const cat = item.category

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
            {/* warm lamp glow */}
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
              {spinning ? 'Shuffling…' : fromRandom ? 'Tonight’s pick' : 'You chose'}
            </p>

            <div
              key={spinning ? item.title : 'final'}
              className={`relative mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-3xl ring-1 ${cat.accent}
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
              {item.title}
            </h2>
            <p className="relative mt-1.5 text-cream/60">{item.detail}</p>

            <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-walnut-950/60 px-3 py-1 text-xs text-cream/70 ring-1 ring-chrome/15">
              <cat.icon className="h-3.5 w-3.5" />
              {cat.name}
              <span className="text-cream/30">·</span>
              <Clock className="h-3.5 w-3.5" />
              {cat.time}
            </div>

            <div className="relative mt-7 grid grid-cols-[1fr_auto] gap-3">
              <button
                ref={primaryRef}
                type="button"
                disabled={spinning}
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-glow px-5 py-4 font-semibold text-walnut-950
                           shadow-[0_8px_24px_-8px_rgba(242,166,90,.8)] transition active:scale-95 hover:bg-[#f6b673] disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-current" />
                Let’s go
              </button>
              <button
                type="button"
                disabled={spinning}
                onClick={onSpin}
                aria-label={fromRandom ? 'Spin again' : 'Surprise me instead'}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cream/5 px-4 py-4 text-cream/80 ring-1 ring-chrome/20
                           transition active:scale-95 hover:bg-cream/10 disabled:opacity-50"
              >
                <RotateCcw className={`h-5 w-5 ${spinning ? 'animate-orbit' : ''}`} />
                <span className="hidden text-sm sm:inline">{fromRandom ? 'Again' : 'Surprise me'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Menu ───────────────────────── */

function MenuItem({ item, accent, onSelect }) {
  const Icon = item.icon
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition duration-200
                   hover:bg-cream/[0.06] hover:translate-x-0.5 active:scale-[0.98]"
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition duration-200
                      group-hover:scale-110 group-hover:shadow-[0_0_20px_-4px_currentColor] ${accent}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-cream">{item.title}</span>
          <span className="block truncate text-sm text-cream/50">{item.detail}</span>
        </span>
      </button>
    </li>
  )
}

function CategoryCard({ cat, onSelect, index }) {
  const CatIcon = cat.icon
  return (
    <section
      className="walnut-panel animate-rise rounded-[1.75rem] p-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)]
                 ring-1 ring-chrome/10 transition duration-300 hover:-translate-y-1 hover:ring-amber-glow/25
                 hover:shadow-[0_28px_50px_-20px_rgba(0,0,0,.9),0_0_40px_-15px_rgba(242,166,90,.35)]"
      style={{ animationDelay: `${120 + index * 80}ms` }}
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
      {/* chrome hairline */}
      <div className="chrome mx-3 h-px opacity-40" />
      <ul className="py-1">
        {cat.items.map((item) => (
          <MenuItem key={item.title} item={item} accent={cat.accent} onSelect={onSelect} />
        ))}
      </ul>
    </section>
  )
}

/* ───────────────────────── App ───────────────────────── */

export default function App() {
  const [current, setCurrent] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [fromRandom, setFromRandom] = useState(false)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const currentRef = useRef(null)
  currentRef.current = current

  const spin = useCallback(() => {
    clearTimers()
    setFromRandom(true)
    const prev = currentRef.current
    const final = pickRandom(prev)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSpinning(false)
      setCurrent(final)
      return
    }

    setSpinning(true)
    setCurrent(prev ?? pickRandom(final))
    // slot-machine style: ticks slow down, then land on the final pick
    let t = 0
    let delay = 60
    let last = prev
    while (t + delay < SPIN_MS) {
      t += delay
      delay *= 1.18
      timers.current.push(
        setTimeout(() => {
          last = pickRandom(last)
          setCurrent(last)
        }, t),
      )
    }
    timers.current.push(
      setTimeout(() => {
        setCurrent(final)
        setSpinning(false)
        navigator.vibrate?.(18)
      }, SPIN_MS),
    )
  }, [])

  const select = (item) => {
    clearTimers()
    setFromRandom(false)
    setSpinning(false)
    setCurrent(item)
  }

  const close = useCallback(() => {
    clearTimers()
    setSpinning(false)
    setCurrent(null)
  }, [])

  useEffect(() => clearTimers, [])

  return (
    <div className="mx-auto min-h-[100dvh] max-w-5xl px-4 pb-16 sm:px-6">
      <Header />

      <div className="mx-auto max-w-md animate-rise">
        <DecideButton onClick={spin} busy={spinning} />
      </div>

      <div className="my-10 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-cream/30" aria-hidden="true">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-chrome/25" />
        or choose
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-chrome/25" />
      </div>

      <main className="grid gap-5 md:grid-cols-2">
        {MENU.map((cat, i) => (
          <CategoryCard key={cat.id} cat={cat} index={i} onSelect={(item) => select({ ...item, category: cat })} />
        ))}
      </main>

      {current && (
        <FocusSheet item={current} spinning={spinning} fromRandom={fromRandom} onClose={close} onSpin={spin} />
      )}
    </div>
  )
}
