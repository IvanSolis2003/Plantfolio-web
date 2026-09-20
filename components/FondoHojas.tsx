const HOJAS = [
  { emoji: "🍂", left: "4%", size: 22, duration: 14, delay: -2 },
  { emoji: "🍁", left: "14%", size: 18, duration: 18, delay: -9 },
  { emoji: "🍂", left: "24%", size: 26, duration: 12, delay: -5 },
  { emoji: "🍁", left: "34%", size: 20, duration: 16, delay: -1 },
  { emoji: "🍂", left: "44%", size: 24, duration: 20, delay: -12 },
  { emoji: "🍁", left: "54%", size: 18, duration: 13, delay: -7 },
  { emoji: "🍂", left: "64%", size: 22, duration: 17, delay: -3 },
  { emoji: "🍁", left: "74%", size: 26, duration: 15, delay: -10 },
  { emoji: "🍂", left: "84%", size: 20, duration: 19, delay: -6 },
  { emoji: "🍁", left: "92%", size: 18, duration: 14, delay: -4 },
  { emoji: "🍂", left: "9%", size: 16, duration: 22, delay: -15 },
  { emoji: "🍁", left: "60%", size: 16, duration: 21, delay: -8 },
];

export default function FondoHojas() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {HOJAS.map((hoja, i) => (
        <span
          key={i}
          className="hoja-cayendo absolute top-0 select-none"
          style={{
            left: hoja.left,
            fontSize: hoja.size,
            animationDuration: `${hoja.duration}s`,
            animationDelay: `${hoja.delay}s`,
          }}
        >
          {hoja.emoji}
        </span>
      ))}
    </div>
  );
}
