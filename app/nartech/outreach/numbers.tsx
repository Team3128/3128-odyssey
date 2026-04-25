"use client"

import { useEffect, useRef, useState } from "react"

function useCountUp(end: number, start: boolean, duration = 2000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return

    let startTime: number | null = null

    const animate = (time: number) => {
      if (!startTime) startTime = time
      const progress = Math.min((time - startTime) / duration, 1)
      setValue(Math.floor(progress * end))

      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [start, end, duration])

  return value
}

function Stat({
  start,
  end,
  label,
  prefix = "",
  suffix = "",
}: {
  start: boolean
  end: number
  label: string
  prefix?: string
  suffix?: string
}) {
  const value = useCountUp(end, start)

  return (
    <div
      className={`transition-all duration-700 ${
        start ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <p className="text-4xl md:text-5xl font-bold text-white">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm text-gray-400 mt-2">{label}</p>
    </div>
  )
}

export default function NumbersSection() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-10 md:p-14 text-center max-w-5xl mx-auto shadow-xl">

        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          By the Numbers
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-gray-200">

          <Stat start={visible} end={3} label="Weeks / Year" />
          <Stat start={visible} end={170} label="Enrollments (2025)" />
          <Stat start={visible} end={500} suffix="+" label="3-Year Total" />
          <Stat start={visible} end={2000} suffix="+" label="Volunteer Hours" />
          <Stat start={visible} end={77207} prefix="$" label="Camp Revenue" />
          <Stat start={visible} end={100} suffix="%" label="Aid Coverage" />

        </div>
      </div>
    </section>
  )
}