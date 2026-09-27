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
      {/* Envelope SVG button */}
      <button
        onClick={onToggle}
        aria-label={open ? 'Close letter' : 'Open letter'}
        className="relative focus:outline-none group"
        style={{
          WebkitTapHighlightColor: 'transparent',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        <svg
          viewBox="0 0 220 150"
          className="w-44 md:w-52"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="envFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1014" />
              <stop offset="100%" stopColor="#130a0e" />
            </linearGradient>
            <linearGradient id="envAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8a4b5" />
              <stop offset="100%" stopColor="#c4607a" />
            </linearGradient>
          </defs>

          {/* Back panel */}
          <rect
            x="10"
            y="30"
            width="200"
            height="110"
            rx="4"
            fill="url(#envFront)"
            stroke="rgba(196,96,122,0.35)"
            strokeWidth="1"
          />

          {/* Letter sliding out */}
          <g
            style={{
              transform: open ? 'translateY(-58px)' : 'translateY(0px)',
              transition: 'transform 1.1s cubic-bezier(0.65, 0, 0.35, 1)',
            }}
          >
            <rect
              x="22"
              y="42"
              width="176"
              height="96"
              rx="2"
              fill="#f2e6e0"
              style={{ opacity: open ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}
            />
            {open && (
              <foreignObject
                x="30"
                y="48"
                width="160"
                height="86"
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    fontFamily: "'Caveat', cursive",
                    color: '#3d2830',
                    fontSize: '11px',
                    lineHeight: 1.35,
                    whiteSpace: 'pre',
                  }}
                >
                  {LETTER_LINES.join('\n')}
                </div>
              </foreignObject>
            )}
          </g>

          {/* Front flap (triangular pocket) */}
          <path
            d="M10 40 L110 100 L210 40 L210 140 L10 140 Z"
            fill="url(#envFront)"
            stroke="rgba(196,96,122,0.35)"
            strokeWidth="1"
          />

          {/* Top flap (open/close) */}
          <g
            style={{
              transformOrigin: '110px 40px',
              transform: open ? 'rotateX(-180deg)' : 'rotateX(0deg)',
              transition: 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
            }}
          >
            <path
              d="M10 40 L110 100 L210 40 Z"
              fill="#0f070a"
              stroke="rgba(196,96,122,0.5)"
              strokeWidth="1"
            />
          </g>

          {/* Wax seal */}
          <g
            style={{
              opacity: open ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}
          >
            <circle cx="110" cy="72" r="14" fill="url(#envAccent)" />
            <circle cx="110" cy="72" r="14" fill="none" stroke="rgba(11,7,9,0.4)" strokeWidth="0.5" />
            <text
              x="110"
              y="76.5"
              textAnchor="middle"
              fontFamily="'Cormorant Garamond', serif"
              fontStyle="italic"
              fontSize="13"
              fill="#3d0f1c"
            >
              F
            </text>
          </g>
        </svg>

        {/* Hover/tap glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(196,96,122,0.25), transparent 65%)',
            filter: 'blur(14px)',
          }}
        />
      </button>

      {/* Hint label */}
      <span
        className="mt-5 text-[#7a5a66] text-[9px] tracking-[0.45em] uppercase transition-opacity duration-500"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          opacity: open ? 0 : 0.7,
        }}
      >
        tap to open
      </span>
    </div>
  )
}

export default App