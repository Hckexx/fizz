import { useEffect, useRef, useState, useMemo } from 'react'

const TARGET_MONTH = 11 // December (0-indexed)
const TARGET_DAY = 9

function getTargetDate() {
  const now = new Date()
  let target = new Date(now.getFullYear(), TARGET_MONTH, TARGET_DAY, 0, 0, 0)
  if (target.getTime() < now.getTime()) {
    target = new Date(now.getFullYear() + 1, TARGET_MONTH, TARGET_DAY, 0, 0, 0)
  }
  return target
}

function useCountdown() {
  const target = useMemo(() => getTargetDate(), [])

  const calc = () => {
    const diff = target.getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, diff: 0 }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      diff,
    }
  }

  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return time
}

// Handwriting letter content — EDIT THIS to your own message
const LETTER_LINES = [
  'Fizz,',
  '',
  "I've been counting down to this",
  'day for a while now.',
  '',
  'Not because of the date.',
  'Because of you.',
  '',
  'There is something waiting on',
  'December 9th.',
  '',
  'And I hope you love it.',
  '',
  '— me',
]

function App() {
  const [phase, setPhase] = useState(0)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const countdown = useCountdown()

  // Total days from when countdown began (adjust if you want)
  const TOTAL_DAYS = 104
  const progress = Math.max(
    0,
    Math.min(1, (TOTAL_DAYS - countdown.days) / TOTAL_DAYS)
  )

  // Staged reveal
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // letterbox + heart starts
      setTimeout(() => setPhase(2), 2400), // name reveals
      setTimeout(() => setPhase(3), 3600), // divider + subtitle
      setTimeout(() => setPhase(4), 5200), // countdown
      setTimeout(() => setPhase(5), 6400), // envelope + signature
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Dust particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const dust = Array.from({ length: 45 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1 + 0.2,
      vx: (Math.random() - 0.5) * 0.06,
      vy: -0.04 - Math.random() * 0.06,
      a: Math.random() * 0.4 + 0.06,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      dust.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5)
        g.addColorStop(0, `rgba(255, 220, 230, ${p.a})`)
        g.addColorStop(1, 'rgba(255, 220, 230, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.scale(dpr, dpr)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const tap = () => {
    if ('vibrate' in navigator) navigator.vibrate?.(12)
  }

  const handleEnvelope = () => {
    tap()
    setEnvelopeOpen((v) => !v)
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#0b0709] selection:bg-[#c4607a] selection:text-[#f4e4e9]">
      {/* Warm film tone */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(196, 96, 122, 0.16) 0%, rgba(30, 12, 20, 0.5) 45%, #0b0709 85%)',
        }}
      />

      {/* Warm color overlay (Kodak Portra-ish) */}
      <div
        className="fixed inset-0 pointer-events-none z-[2] mix-blend-soft-light opacity-60"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 200, 190, 0.08) 0%, rgba(140, 90, 110, 0.06) 100%)',
        }}
      />

      {/* Film grain */}
      <div
        className="fixed inset-0 pointer-events-none z-[3] opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Dust */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[4]"
      />

      {/* Letterbox bars */}
      <div
        className="fixed top-0 left-0 right-0 bg-black z-[20] pointer-events-none"
        style={{
          height: phase >= 1 ? '5vh' : '0vh',
          transition: 'height 1.6s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 bg-black z-[20] pointer-events-none"
        style={{
          height: phase >= 1 ? '5vh' : '0vh',
          transition: 'height 1.6s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-24">
        {/* Heart */}
        <div
          className="mb-10 md:mb-12"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 1.6s ease',
            animation: phase >= 2 ? 'breathe 6s ease-in-out infinite' : 'none',
          }}
        >
          <svg
            viewBox="0 0 200 180"
            className="w-20 h-20 md:w-28 md:h-28"
            style={{ display: 'block' }}
          >
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8a4b5" />
                <stop offset="100%" stopColor="#c4607a" />
              </linearGradient>
            </defs>
            <path
              d="M100 170 C 40 130, 10 90, 20 55 C 28 28, 60 18, 85 40 C 92 47, 98 55, 100 62 C 102 55, 108 47, 115 40 C 140 18, 172 28, 180 55 C 190 90, 160 130, 100 170 Z"
              fill="none"
              stroke="url(#rg)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: phase >= 1 ? 0 : 600,
                transition:
                  'stroke-dashoffset 2.6s cubic-bezier(0.65, 0, 0.35, 1) 0.2s',
                filter: 'drop-shadow(0 0 18px rgba(196, 96, 122, 0.3))',
              }}
            />
            <path
              d="M100 170 C 40 130, 10 90, 20 55 C 28 28, 60 18, 85 40 C 92 47, 98 55, 100 62 C 102 55, 108 47, 115 40 C 140 18, 172 28, 180 55 C 190 90, 160 130, 100 170 Z"
              fill="rgba(196, 96, 122, 0.07)"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transition: 'opacity 1.8s ease',
              }}
            />
          </svg>
        </div>

        {/* Name — per-letter reveal */}
        <h1
          className="text-[#f4e4e9] text-center leading-[0.95]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(4.5rem, 22vw, 8rem)',
            letterSpacing: '-0.03em',
          }}
          aria-label="Fizz"
        >
          {'Fizz'.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: phase >= 2 ? 'translateY(0)' : 'translateY(110%)',
                opacity: phase >= 2 ? 1 : 0,
                transition: `transform 1.1s cubic-bezier(0.65, 0, 0.35, 1) ${
                  2.4 + i * 0.09
                }s, opacity 1.1s ease ${2.4 + i * 0.09}s`,
              }}
            >
              {ch}
            </span>
          ))}
        </h1>

        {/* Divider */}
        <div
          className="my-7 h-px"
          style={{
            width: phase >= 3 ? 'min(220px, 55vw)' : '0px',
            background:
              'linear-gradient(90deg, transparent, rgba(196,96,122,0.65), transparent)',
            transition: 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)',
          }}
        />

        {/* Typing subtitle */}
        <TypingText
          text="Something is waiting for you"
          active={phase >= 3}
          speed={45}
        />

        {/* Countdown */}
        <div
          className="mt-12 md:mt-16 w-full max-w-[440px]"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(16px)',
            transition:
              'opacity 1.4s ease 0.2s, transform 1.4s cubic-bezier(0.65,0,0.35,1) 0.2s',
          }}
        >
          <div className="flex items-start justify-center gap-3 md:gap-6">
            <TimeUnit value={countdown.days} label="Days" />
            <Dot />
            <TimeUnit value={countdown.hours} label="Hours" padded />
            <Dot />
            <TimeUnit value={countdown.minutes} label="Min" padded />
            <Dot />
            <TimeUnit value={countdown.seconds} label="Sec" padded />
          </div>

          {/* Progress bar */}
          <div className="mt-10 flex flex-col items-center">
            <div
              className="relative w-full max-w-[280px] h-px overflow-hidden"
              style={{ background: 'rgba(196,96,122,0.18)' }}
            >
              <div
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${progress * 100}%`,
                  background:
                    'linear-gradient(90deg, rgba(196,96,122,0.3), rgba(232,164,181,1))',
                  transition: 'width 2s cubic-bezier(0.65,0,0.35,1)',
                  boxShadow: '0 0 12px rgba(232,164,181,0.5)',
                }}
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span
                className="text-[#7a5a66] text-[9px] tracking-[0.4em] uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
              >
                {countdown.days} days left
              </span>
              <span
                className="text-[#7a5a66]/40 text-[9px]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ·
              </span>
              <span
                className="text-[#7a5a66] text-[9px] tracking-[0.4em] uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
              >
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Envelope */}
        <div
          className="mt-16 md:mt-20"
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? 'translateY(0)' : 'translateY(20px)',
            transition:
              'opacity 1.6s ease, transform 1.6s cubic-bezier(0.65,0,0.35,1)',
          }}
        >
          <Envelope open={envelopeOpen} onToggle={handleEnvelope} />
        </div>
      </div>

      {/* Bottom signature */}
      <div
        className="fixed bottom-[6vh] left-0 right-0 z-10 flex justify-center pointer-events-none"
        style={{
          opacity: phase >= 5 ? 1 : 0,
          transition: 'opacity 2s ease 0.6s',
        }}
      >
        <span
          className="text-[#5a3d48] text-[9px] tracking-[0.45em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
        >
          for her · dec 09
        </span>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ---------- Typing subtitle ----------
function TypingText({
  text,
  active,
  speed = 45,
}: {
  text: string
  active: boolean
  speed?: number
}) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    if (!active) return
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [active, text, speed])

  return (
    <div className="relative overflow-hidden px-2">
      <p
        className="text-[#c9b4bb] text-[11px] md:text-xs tracking-[0.42em] uppercase text-center"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
        }}
      >
        {shown}
        {active && shown.length < text.length && (
          <span
            style={{
              display: 'inline-block',
              width: '1px',
              height: '0.9em',
              marginLeft: '3px',
              background: '#c4607a',
              verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }}
          />
        )}
      </p>
    </div>
  )
}

// ---------- Time unit ----------
function TimeUnit({
  value,
  label,
  padded,
}: {
  value: number
  label: string
  padded?: boolean
}) {
  return (
    <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
      <span
        className="text-[#f4e4e9] leading-none tabular-nums"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontSize: 'clamp(2.2rem, 10vw, 3.25rem)',
          letterSpacing: '-0.02em',
        }}
      >
        {padded ? String(value).padStart(2, '0') : value}
      </span>
      <span
        className="mt-3 text-[#7a5a66] text-[9px] md:text-[10px] tracking-[0.35em] uppercase"
        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
      >
        {label}
      </span>
    </div>
  )
}

// ---------- Dot separator ----------
function Dot() {
  return (
    <span
      className="text-[#c4607a]/40 select-none"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.6rem',
        marginTop: '0.6rem',
        lineHeight: 1,
      }}
    >
      ·
    </span>
  )
}

// ---------- Envelope ----------
function Envelope({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ display: 'inline-block' }}>
        {/* Envelope button */}
        <button
          onClick={onToggle}
          aria-label={open ? 'Close letter' : 'Open letter'}
          className="relative block focus:outline-none"
          style={{
            WebkitTapHighlightColor: 'transparent',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <div
            className="relative"
            style={{
              width: 'clamp(240px, 65vw, 300px)',
              height: 'clamp(150px, 40vw, 185px)',
              perspective: '1200px',
            }}
          >
            {/* Back panel */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(160deg, #241518 0%, #130a0e 100%)',
                border: '1px solid rgba(196, 96, 122, 0.4)',
                borderRadius: '4px',
                boxShadow: '0 24px 50px -15px rgba(0,0,0,0.7)',
              }}
            />

            {/* Pocket (front, V-shape at top) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(160deg, #2a1a1e 0%, #1a1014 100%)',
                border: '1px solid rgba(196, 96, 122, 0.35)',
                borderRadius: '4px',
                clipPath:
                  'polygon(0 42%, 50% 100%, 100% 42%, 100% 100%, 0 100%)',
                zIndex: 3,
              }}
            />

            {/* Top flap (triangle pointing down) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: '58%',
                background:
                  'linear-gradient(160deg, #2f1c22 0%, #1a1014 100%)',
                border: '1px solid rgba(196, 96, 122, 0.5)',
                borderBottom: 'none',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                transformOrigin: 'top center',
                transform: open ? 'rotateX(-180deg)' : 'rotateX(0deg)',
                transition:
                  'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
                zIndex: 4,
                borderRadius: '4px 4px 0 0',
                backfaceVisibility: 'visible',
              }}
            />

            {/* Wax seal */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '42%',
                width: 'clamp(30px, 8vw, 38px)',
                height: 'clamp(30px, 8vw, 38px)',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 32% 32%, #f0b6c4 0%, #c4607a 65%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(14px, 3.5vw, 17px)',
                color: '#3d0f1c',
                zIndex: 5,
                transform: 'translate(-50%, -50%)',
                transition: 'opacity 0.35s ease',
                opacity: open ? 0 : 1,
                boxShadow:
                  '0 4px 12px rgba(196,96,122,0.5), inset 0 -2px 4px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
              }}
            >
              F
            </div>
          </div>
        </button>

        {/* Letter — appears above envelope, slides up */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'calc(100% + 14px)',
            width: 'min(320px, 88vw)',
            background: '#f4e9e2',
            padding: '22px 24px',
            borderRadius: '2px',
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(15px, 4vw, 17px)',
            lineHeight: 1.5,
            color: '#3d2830',
            boxShadow:
              '0 20px 50px -10px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.15)',
            opacity: open ? 1 : 0,
            transform: open
              ? 'translateX(-50%) translateY(0) scale(1)'
              : 'translateX(-50%) translateY(28px) scale(0.96)',
            transformOrigin: 'bottom center',
            transition:
              'opacity 0.7s ease, transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
            pointerEvents: open ? 'auto' : 'none',
            zIndex: 6,
            textAlign: 'left',
          }}
        >
          {LETTER_LINES.map((line, i) => (
            <p key={i} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      </div>

      {/* Hint */}
      <span
        className="mt-5 text-[#7a5a66] text-[9px] tracking-[0.45em] uppercase"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          opacity: open ? 0 : 0.7,
          transition: 'opacity 0.4s ease',
        }}
      >
        tap to open
      </span>
    </div>
  )
}

export default App
