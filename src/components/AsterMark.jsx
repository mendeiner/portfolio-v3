export default function AsterMark({ size = 40, color = '#FE214D', className = '' }) {
  const r = 44
  const cx = 50
  const cy = 50

  const arms = [0, 60, 120].map((deg) => {
    const rad = (deg * Math.PI) / 180
    const x1 = cx + r * Math.sin(rad)
    const y1 = cy - r * Math.cos(rad)
    const x2 = cx - r * Math.sin(rad)
    const y2 = cy + r * Math.cos(rad)
    return { x1, y1, x2, y2 }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {arms.map((a, i) => (
        <line
          key={i}
          x1={a.x1}
          y1={a.y1}
          x2={a.x2}
          y2={a.y2}
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
