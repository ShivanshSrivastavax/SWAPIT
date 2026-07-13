export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-14 h-20">
        <div className="absolute inset-0 rounded-xl border-4 border-cream/20 border-t-card-yellow animate-spin" />
      </div>
      <p className="text-cream/70 font-medium tracking-wide">{label}</p>
    </div>
  )
}
