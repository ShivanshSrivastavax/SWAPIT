const OPTIONS = [
  { key: 'red', label: 'Red', className: 'bg-card-red' },
  { key: 'yellow', label: 'Yellow', className: 'bg-card-yellow' },
  { key: 'green', label: 'Green', className: 'bg-card-green' },
  { key: 'blue', label: 'Blue', className: 'bg-card-blue' },
]

export default function ColorPicker({ onChoose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="rounded-2xl bg-felt-dark border-2 border-cream/20 p-6 text-center shadow-card">
        <h3 className="font-display font-bold text-lg mb-4">Choose a color</h3>
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => onChoose(o.key)}
              className={`${o.className} w-20 h-20 rounded-xl shadow-card hover:scale-105 transition-transform focus-ring`}
              aria-label={o.label}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
