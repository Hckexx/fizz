import { useEffect, useRef, useState, useMemo } from 'react'

const TARGET_MONTH = 11
const TARGET_DAY = 9

function getTargetDate() {
  const now = new Date()

  let target = new Date(
    now.getFullYear(),
    TARGET_MONTH,
    TARGET_DAY,
    0,
    0,
    0
  )

  if (target.getTime() < now.getTime()) {
    target = new Date(
      now.getFullYear() + 1,
      TARGET_MONTH,
      TARGET_DAY,
      0,
      0,
      0
    )
  }

  return target
}

function useCountdown() {
  const target = useMemo(() => getTargetDate(), [])

  const calc = () => {
    const diff = target.getTime() - Date.now()

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        diff: 0,
      }
    }

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
    const id = setInterval(() => {
      setTime(calc())
    }, 1000)

    return () => clearInterval(id)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return time
}

function App() {
  const [phase, setPhase] = useState(0)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const countdown = useCountdown()

  const TOTAL_DAYS = 104

  const progress = Math.max(
    0,
    Math.min(1, (TOTAL_DAYS - countdown.days) / TOTAL_DAYS)
  )

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

  /* =========================================================
     FLOATING DUST
     ========================================================= */

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

      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

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

        const g = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.r * 5
        )

        g.addColorStop(
          0,
          `rgba(255, 220, 230, ${p.a})`
        )

        g.addColorStop(
          1,
          'rgba(255, 220, 230, 0)'
        )

        ctx.fillStyle = g

        ctx.beginPath()
        ctx.arc(
          p.x,
          p.y,
          p.r * 5,
          0,
          Math.PI * 2
        )

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
    if ('vibrate' in navigator) {
      navigator.vibrate?.(12)
    }
  }

  const handleEnvelope = () => {
    tap()
    setEnvelopeOpen((v) => !v)
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#0b0709] selection:bg-[#c4607a] selection:text-[#f4e4e9]">

      {/* =========================================================
          BACKGROUND
         ========================================================= */}

      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(196, 96, 122, 0.16) 0%, rgba(30, 12, 20, 0.5) 45%, #0b0709 85%)',
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-[2] mix-blend-soft-light opacity-60"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 200, 190, 0.08) 0%, rgba(140, 90, 110, 0.06) 100%)',
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-[3] opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[4]"
      />

      {/* Cinematic bars */}

      <div
        className="fixed top-0 left-0 right-0 bg-black z-[20] pointer-events-none"
        style={{
          height: phase >= 1 ? '5vh' : '0vh',
          transition:
            'height 1.6s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      />

      <div
        className="fixed bottom-0 left-0 right-0 bg-black z-[20] pointer-events-none"
        style={{
          height: phase >= 1 ? '5vh' : '0vh',
          transition:
            'height 1.6s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      />

      {/* =========================================================
          MAIN CONTENT
         ========================================================= */}

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center px-6 pt-20 pb-20">

        {/* HEART */}

        <div
          className="mb-10 md:mb-12"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 1.6s ease',
            animation:
              phase >= 2
                ? 'breathe 6s ease-in-out infinite'
                : 'none',
          }}
        >
          <svg
            viewBox="0 0 200 180"
            className="w-20 h-20 md:w-28 md:h-28"
            style={{
              display: 'block',
            }}
          >
            <defs>
              <linearGradient
                id="rg"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#e8a4b5"
                />

                <stop
                  offset="100%"
                  stopColor="#c4607a"
                />
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
                strokeDashoffset:
                  phase >= 1 ? 0 : 600,
                transition:
                  'stroke-dashoffset 2.6s cubic-bezier(0.65, 0, 0.35, 1) 0.2s',
                filter:
                  'drop-shadow(0 0 18px rgba(196, 96, 122, 0.3))',
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

        {/* TITLE */}

        <h1
          className="text-[#f4e4e9] text-center leading-[0.95]"
          style={{
            fontFamily:
              "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize:
              'clamp(4.5rem, 22vw, 8rem)',
            letterSpacing: '-0.03em',
          }}
          aria-label="Fizz"
        >
          {'Fizz'.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform:
                  phase >= 2
                    ? 'translateY(0)'
                    : 'translateY(110%)',
                opacity:
                  phase >= 2 ? 1 : 0,
                transition: `transform 1.1s cubic-bezier(0.65, 0, 0.35, 1) ${
                  2.4 + i * 0.09
                }s, opacity 1.1s ease ${
                  2.4 + i * 0.09
                }s`,
              }}
            >
              {ch}
            </span>
          ))}
        </h1>

        {/* DIVIDER */}

        <div
          className="my-7 h-px"
          style={{
            width:
              phase >= 3
                ? 'min(220px, 55vw)'
                : '0px',

            background:
              'linear-gradient(90deg, transparent, rgba(196,96,122,0.65), transparent)',

            transition:
              'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)',
          }}
        />

        {/* SUBTITLE */}

        <TypingText
          text="Something is waiting for you"
          active={phase >= 3}
          speed={45}
        />

        {/* =========================================================
            COUNTDOWN
           ========================================================= */}

        <div
          className="mt-12 md:mt-16 w-full max-w-[440px]"
          style={{
            opacity: phase >= 4 ? 1 : 0,

            transform:
              phase >= 4
                ? 'translateY(0)'
                : 'translateY(16px)',

            transition:
              'opacity 1.4s ease 0.2s, transform 1.4s cubic-bezier(0.65,0,0.35,1) 0.2s',
          }}
        >
          <div className="flex items-start justify-center gap-3 md:gap-6">

            <TimeUnit
              value={countdown.days}
              label="Days"
            />

            <Dot />

            <TimeUnit
              value={countdown.hours}
              label="Hours"
              padded
            />

            <Dot />

            <TimeUnit
              value={countdown.minutes}
              label="Min"
              padded
            />

            <Dot />

            <TimeUnit
              value={countdown.seconds}
              label="Sec"
              padded
            />

          </div>

          {/* Progress */}

          <div className="mt-10 flex flex-col items-center">

            <div
              className="relative w-full max-w-[280px] h-px overflow-hidden"
              style={{
                background:
                  'rgba(196,96,122,0.18)',
              }}
            >
              <div
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${progress * 100}%`,
                  background:
                    'linear-gradient(90deg, rgba(196,96,122,0.3), rgba(232,164,181,1))',
                  transition:
                    'width 2s cubic-bezier(0.65,0,0.35,1)',
                  boxShadow:
                    '0 0 12px rgba(232,164,181,0.5)',
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-3">

              <span
                className="text-[#7a5a66] text-[9px] tracking-[0.4em] uppercase"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                }}
              >
                {countdown.days} days left
              </span>

              <span
                className="text-[#7a5a66]/40 text-[9px]"
                style={{
                  fontFamily:
                    "'JetBrains Mono', monospace",
                }}
              >
                ·
              </span>

              <span
                className="text-[#7a5a66] text-[9px] tracking-[0.4em] uppercase"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                }}
              >
                {Math.round(progress * 100)}%
              </span>

            </div>
          </div>
        </div>

        {/* =========================================================
            ENVELOPE
           ========================================================= */}

        <div
          className="mt-16 md:mt-20 w-full flex justify-center"
          style={{
            opacity: phase >= 5 ? 1 : 0,

            transform:
              phase >= 5
                ? 'translateY(0)'
                : 'translateY(20px)',

            transition:
              'opacity 1.6s ease, transform 1.6s cubic-bezier(0.65,0,0.35,1)',
          }}
        >
          <Envelope
            open={envelopeOpen}
            onToggle={handleEnvelope}
          />
        </div>

        {/* FOOTER */}

        <div
          className="mt-8 pb-10 flex justify-center pointer-events-none"
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transition:
              'opacity 2s ease 0.6s',
          }}
        >
          <span
            className="text-[#5a3d48] text-[9px] tracking-[0.45em] uppercase"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
            }}
          >
            for her · dec 09
          </span>
        </div>

      </div>

      {/* =========================================================
          ANIMATIONS
         ========================================================= */}

      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.015);
          }
        }

        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }

          50%, 100% {
            opacity: 0;
          }
        }
      `}</style>

    </div>
  )
}

/* =========================================================
   TYPING TEXT
   ========================================================= */

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

      if (i >= text.length) {
        clearInterval(id)
      }
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

        {active &&
          shown.length < text.length && (
            <span
              style={{
                display: 'inline-block',
                width: '1px',
                height: '0.9em',
                marginLeft: '3px',
                background: '#c4607a',
                verticalAlign: 'middle',
                animation:
                  'blink 1s step-end infinite',
              }}
            />
          )}
      </p>

    </div>
  )
}

/* =========================================================
   TIME UNIT
   ========================================================= */

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
          fontFamily:
            "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontSize:
            'clamp(2.2rem, 10vw, 3.25rem)',
          letterSpacing: '-0.02em',
        }}
      >
        {padded
          ? String(value).padStart(2, '0')
          : value}
      </span>

      <span
        className="mt-3 text-[#7a5a66] text-[9px] md:text-[10px] tracking-[0.35em] uppercase"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
        }}
      >
        {label}
      </span>

    </div>
  )
}

/* =========================================================
   DOT
   ========================================================= */

function Dot() {
  return (
    <span
      className="text-[#c4607a]/40 select-none"
      style={{
        fontFamily:
          "'Cormorant Garamond', serif",
        fontSize: '1.6rem',
        marginTop: '0.6rem',
        lineHeight: 1,
      }}
    >
      ·
    </span>
  )
}

/* =========================================================
   ENVELOPE
   ========================================================= */

function Envelope({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col items-center">

      {/* IMPORTANT:
          Fixed-height wrapper.
          No giant paddingTop.
      */}

      <div
        className="relative"
        style={{
          width: 'clamp(250px, 76vw, 320px)',
          height: 'clamp(175px, 46vw, 215px)',
        }}
      >

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            open ? 'Close letter' : 'Open letter'
          }
          className="relative block w-full h-full appearance-none border-0 bg-transparent p-0 outline-none focus-visible:ring-1 focus-visible:ring-[#c4607a]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0b0709]"
          style={{
            cursor: 'pointer',
            perspective: '1400px',
            WebkitTapHighlightColor:
              'transparent',
          }}
        >

          {/* =====================================================
              LETTER
             ===================================================== */}

          <div
            style={{
              position: 'absolute',
              left: '6%',
              right: '6%',
              bottom: '7%',

              /*
               * The letter stays controlled on mobile.
               * It cannot become a giant element.
               */
              maxHeight: '260px',

              padding: '22px 22px 24px',

              background:
                'linear-gradient(145deg, #f8eee7 0%, #efe0d8 100%)',

              borderRadius: '2px',

              border:
                '1px solid rgba(95, 55, 65, 0.12)',

              fontFamily: "'Caveat', cursive",

              fontSize:
                'clamp(16px, 4.4vw, 18px)',

              lineHeight: 1.5,

              color: '#3d2830',

              textAlign: 'left',

              /*
               * Controlled movement.
               *
               * DO NOT use -100%.
               * That was causing the unpredictable overlap.
               */
              transform: open
                ? 'translateY(-125px) rotate(-0.4deg)'
                : 'translateY(0) rotate(0deg)',

              opacity: open ? 1 : 0,

              transition: open
                ? 'transform 1.05s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.45s ease 0.25s'
                : 'transform 1.05s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.2s ease',

              boxShadow: open
                ? '0 24px 45px -16px rgba(0,0,0,0.55)'
                : '0 8px 20px -12px rgba(0,0,0,0.35)',

              zIndex: 1,

              pointerEvents:
                open ? 'auto' : 'none',
            }}
          >

            {/* Paper texture */}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity: 0.14,

                backgroundImage:
                  'radial-gradient(rgba(70,40,45,0.35) 0.5px, transparent 0.5px)',

                backgroundSize: '4px 4px',
              }}
            />

            {/* Letter content */}

            <div
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >

              <p
                style={{
                  margin: 0,
                  fontSize: '1.18em',
                  marginBottom: '8px',
                }}
              >
                Bebe,
              </p>

              <p style={{ margin: 0 }}>
                This little countdown isn't really
                about a date. It's about you.
              </p>

              <p
                style={{
                  margin: '9px 0 0',
                }}
              >
                You are my favourite thought in the
                quiet moments, my comfort on the
                difficult days, and one of the most
                beautiful parts of my life.
              </p>

              <p
                style={{
                  margin: '9px 0 0',
                }}
              >
                I could write a thousand things and
                still not find the right words for
                what you mean to me.
              </p>

              <p
                style={{
                  margin: '9px 0 0',
                }}
              >
                So until December 9th, keep this
                little secret close to your heart.
                Something special is waiting for you.
              </p>

              <p
                style={{
                  margin: '10px 0 0',
                  textAlign: 'right',
                  fontStyle: 'italic',
                }}
              >
                With all my love,
                <br />
                yours ❤️
              </p>

            </div>

          </div>

          {/* =====================================================
              ENVELOPE BACK
             ===================================================== */}

          <div
            style={{
              position: 'absolute',
              inset: 0,

              background:
                'linear-gradient(145deg, #2b191f 0%, #130a0e 75%)',

              border:
                '1px solid rgba(196, 96, 122, 0.42)',

              borderRadius: '5px',

              boxShadow:
                '0 28px 55px -18px rgba(0,0,0,0.78), inset 0 1px 0 rgba(255,255,255,0.035)',

              zIndex: 0,

              overflow: 'hidden',
            }}
          >

            <div
              style={{
                position: 'absolute',
                inset: 0,

                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.035), transparent 35%, rgba(196,96,122,0.025))',

                pointerEvents: 'none',
              }}
            />

          </div>

          {/* =====================================================
              INNER LETTER SHADOW
             ===================================================== */}

          <div
            style={{
              position: 'absolute',
              left: '5%',
              right: '5%',
              bottom: '8%',

              height: '45%',

              background:
                'rgba(0,0,0,0.38)',

              filter: 'blur(12px)',

              opacity:
                open ? 0.12 : 0.55,

              transition:
                'opacity 0.7s ease',

              zIndex: 1,

              pointerEvents: 'none',
            }}
          />

          {/* =====================================================
              FRONT POCKET
             ===================================================== */}

          <div
            style={{
              position: 'absolute',
              inset: 0,

              background:
                'linear-gradient(145deg, #2d1b21 0%, #191014 100%)',

              border:
                '1px solid rgba(196, 96, 122, 0.32)',

              borderRadius: '5px',

              clipPath:
                'polygon(0 42%, 50% 91%, 100% 42%, 100% 100%, 0 100%)',

              zIndex: 2,

              pointerEvents: 'none',

              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.025)',
            }}
          />

          {/* =====================================================
              TOP FLAP
             ===================================================== */}

          <div
            style={{
              position: 'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: '59%',

              background:
                'linear-gradient(155deg, #351e26 0%, #1b1015 72%)',

              clipPath:
                'polygon(0 0, 100% 0, 50% 100%)',

              transformOrigin:
                'top center',

              transform: open
                ? 'rotateX(170deg)'
                : 'rotateX(0deg)',

              transition:
                'transform 1s cubic-bezier(0.65, 0, 0.35, 1)',

              zIndex: 3,

              borderRadius:
                '5px 5px 0 0',

              boxShadow: open
                ? '0 10px 18px rgba(0,0,0,0.12)'
                : '0 3px 12px rgba(0,0,0,0.38)',

              pointerEvents: 'none',
            }}
          >

            <div
              style={{
                position: 'absolute',
                inset: 0,

                background:
                  'linear-gradient(150deg, rgba(255,255,255,0.045), transparent 45%)',

                pointerEvents: 'none',
              }}
            />

          </div>

          {/* =====================================================
              WAX SEAL
             ===================================================== */}

          <div
            style={{
              position: 'absolute',

              left: '50%',
              top: '48%',

              width:
                'clamp(32px, 9vw, 42px)',

              height:
                'clamp(32px, 9vw, 42px)',

              borderRadius: '50%',

              background:
                'radial-gradient(circle at 30% 28%, #f4c3cf 0%, #d87992 35%, #c4607a 68%, #8d3c53 100%)',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              fontFamily:
                "'Cormorant Garamond', serif",

              fontStyle: 'italic',

              fontSize:
                'clamp(15px, 4vw, 18px)',

              color: '#3d0f1c',

              zIndex: 4,

              transform: open
                ? 'translate(-50%, -50%) scale(0.7) rotate(-8deg)'
                : 'translate(-50%, -50%) scale(1) rotate(0deg)',

              opacity:
                open ? 0 : 1,

              transition:
                'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.3s ease 0.12s',

              boxShadow:
                '0 5px 14px rgba(196,96,122,0.48), inset 0 -3px 5px rgba(0,0,0,0.25), inset 1px 1px 2px rgba(255,255,255,0.25)',

              pointerEvents: 'none',
            }}
          >
            F
          </div>

        </button>
      </div>

      {/* =========================================================
          OPEN HINT
         ========================================================= */}

      <span
        className="mt-4 text-[#7a5a66] text-[9px] tracking-[0.45em] uppercase"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,

          opacity:
            open ? 0 : 0.7,

          transform:
            open
              ? 'translateY(4px)'
              : 'translateY(0)',

          transition:
            'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        tap to open
      </span>

    </div>
  )
}

export default App
