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

function App() {
  const [phase, setPhase] = useState(0)
  const [letterOpen, setLetterOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const countdown = useCountdown()

  const TOTAL_DAYS = 104
  const progress = Math.max(
    0,
    Math.min(1, (TOTAL_DAYS - countdown.days) / TOTAL_DAYS)
  )

  // Staged reveal
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2400),
      setTimeout(() => setPhase(3), 3600),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => setPhase(5), 6400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // ESC to close letter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLetterOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Lock body scroll when letter is open
  useEffect(() => {
    if (letterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [letterOpen])

  // Dust particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = window.innerWidth
    let h = window.innerHeight

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const setup = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    setup()

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

    const onResize = () => setup()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const tap = () => {
    if ('vibrate' in navigator) navigator.vibrate?.(12)
  }

  const openLetter = () => {
    tap()
    setLetterOpen(true)
  }

  const closeLetter = () => {
    tap()
    setLetterOpen(false)
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#0b0709] selection:bg-[#c4607a] selection:text-[#f4e4e9]">
      {/* Warm film tone */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(196, 96, 122, 0.16) 0%, rgba(30, 12, 20, 0.5) 45%, #0b0709 85%)',
        }}
      />

      {/* Warm color overlay */}
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

      {/* ============================================================
          LETTER BUTTON — top right corner
         ============================================================ */}
      <button
        type="button"
        onClick={openLetter}
        aria-label="Open letter"
        className="fixed top-5 right-5 md:top-7 md:right-7 z-[60] group"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? 'translateY(0)' : 'translateY(-16px)',
          transition:
            'opacity 1.4s ease 0.4s, transform 1.4s cubic-bezier(0.65,0,0.35,1) 0.4s',
          pointerEvents: phase >= 4 ? 'auto' : 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Pulse rings */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(196, 96, 122, 0.5)',
            animation: 'letterPulse 2.8s cubic-bezier(0.65, 0, 0.35, 1) infinite',
          }}
        />
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(196, 96, 122, 0.35)',
            animation:
              'letterPulse 2.8s cubic-bezier(0.65, 0, 0.35, 1) infinite 1.4s',
          }}
        />

        {/* Inner circle */}
        <span
          className="relative flex items-center justify-center rounded-full transition-all duration-500 group-hover:scale-105"
          style={{
            width: 'clamp(46px, 11vw, 54px)',
            height: 'clamp(46px, 11vw, 54px)',
            background:
              'linear-gradient(145deg, rgba(40, 22, 28, 0.9), rgba(19, 10, 14, 0.95))',
            border: '1px solid rgba(196, 96, 122, 0.4)',
            boxShadow:
              '0 10px 30px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {/* Envelope icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              width: '44%',
              height: '44%',
              color: '#e8a4b5',
              transition: 'color 0.4s ease',
            }}
            className="group-hover:!text-[#f4c3cf]"
          >
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <path d="M3 8l9 6 9-6" />
          </svg>
        </span>

        {/* Tooltip */}
        <span
          className="absolute top-full right-0 mt-3 text-[9px] tracking-[0.4em] uppercase whitespace-nowrap pointer-events-none"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            color: '#7a5a66',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          a letter for you
        </span>
      </button>

      {/* ============================================================
          MAIN CONTENT
         ============================================================ */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-20 pb-24">
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

        {/* Name */}
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

        {/* Hint to open letter */}
        <div
          className="mt-14 md:mt-16 flex flex-col items-center"
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
      </div>

      {/* ============================================================
          LETTER MODAL
         ============================================================ */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        style={{
          background: letterOpen ? 'rgba(11, 7, 9, 0.78)' : 'rgba(11, 7, 9, 0)',
          backdropFilter: letterOpen ? 'blur(14px)' : 'blur(0px)',
          WebkitBackdropFilter: letterOpen ? 'blur(14px)' : 'blur(0px)',
          opacity: letterOpen ? 1 : 0,
          pointerEvents: letterOpen ? 'auto' : 'none',
          transition:
            'opacity 0.5s ease, backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease',
        }}
        onClick={closeLetter}
        aria-hidden={!letterOpen}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeLetter}
          aria-label="Close letter"
          className="absolute top-5 right-5 md:top-7 md:right-7 flex items-center justify-center rounded-full transition-all duration-300 hover:rotate-90"
          style={{
            width: 'clamp(38px, 9vw, 44px)',
            height: 'clamp(38px, 9vw, 44px)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#f4e4e9',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Letter stack */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center"
          style={{
            maxWidth: 'min(440px, 100%)',
            width: '100%',
            transform: letterOpen
              ? 'translateY(0) scale(1)'
              : 'translateY(40px) scale(0.94)',
            opacity: letterOpen ? 1 : 0,
            transition: letterOpen
              ? 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1) 0.15s, opacity 0.6s ease 0.15s'
              : 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.35s ease',
            maxHeight: '85vh',
          }}
        >
          {/* Wax seal on top */}
          <div
            style={{
              zIndex: 3,
              width: 'clamp(46px, 11vw, 54px)',
              height: 'clamp(46px, 11vw, 54px)',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 30% 28%, #f4c3cf 0%, #d87992 35%, #c4607a 68%, #8d3c53 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 5vw, 22px)',
              color: '#3d0f1c',
              marginBottom: '-24px',
              boxShadow:
                '0 8px 20px rgba(196,96,122,0.55), inset 0 -4px 6px rgba(0,0,0,0.28), inset 2px 2px 3px rgba(255,255,255,0.3)',
              transform: letterOpen ? 'rotate(0deg)' : 'rotate(-15deg)',
              transition: 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.3s',
            }}
          >
            F
          </div>

          {/* Letter paper */}
          <div
            className="relative w-full overflow-y-auto"
            style={{
              background:
                'linear-gradient(145deg, #f8eee7 0%, #efe0d8 100%)',
              borderRadius: '3px',
              border: '1px solid rgba(95, 55, 65, 0.15)',
              padding: '48px clamp(24px, 7vw, 34px) clamp(28px, 7vw, 36px)',
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(16px, 4.4vw, 18px)',
              lineHeight: 1.55,
              color: '#3d2830',
              boxShadow:
                '0 40px 90px -25px rgba(0,0,0,0.65), 0 0 60px -20px rgba(196,96,122,0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
              maxHeight: 'calc(85vh - 30px)',
            }}
          >
            {/* Paper texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: 0.16,
                backgroundImage:
                  'radial-gradient(rgba(70,40,45,0.35) 0.5px, transparent 0.5px)',
                backgroundSize: '4px 4px',
                mixBlendMode: 'multiply',
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <p
                style={{
                  margin: 0,
                  fontSize: '1.25em',
                  marginBottom: '14px',
                  fontStyle: 'italic',
                }}
              >
                Bebe,
              </p>

              <p style={{ margin: 0 }}>
                This little countdown isn't really about a date. It's about
                you.
              </p>

              <p style={{ margin: '12px 0 0' }}>
                Somewhere along the way, you became someone very special to me.
              </p>

              <p style={{ margin: '12px 0 0' }}>
                And now I can't wait for December 9th — for your smile, your
                presence, and that moment I've been looking forward to.
              </p>

              <p style={{ margin: '14px 0 0' }}>
                Until then, keep this little secret close.
              </p>

              <p
                style={{
                  margin: '20px 0 0',
                  textAlign: 'right',
                  fontStyle: 'italic',
                  fontSize: '1.05em',
                }}
              >
                — always, me
              </p>

              {/* Signature divider */}
              <div
                style={{
                  marginTop: '22px',
                  height: '1px',
                  width: '100%',
                  background:
                    'linear-gradient(90deg, transparent, rgba(140, 80, 95, 0.2), transparent)',
                }}
              />

              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: '10px',
                  textAlign: 'center',
                  color: 'rgba(95, 55, 65, 0.5)',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                }}
              >
                sealed · dec 09
              </p>
            </div>
          </div>
        </div>
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
        @keyframes letterPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.7); opacity: 0; }
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

export default App
