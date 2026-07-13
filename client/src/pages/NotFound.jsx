import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display font-extrabold text-7xl text-card-red mb-2">404</p>
      <h1 className="font-display font-bold text-2xl mb-2">Card not found</h1>
      <p className="text-cream/60 mb-6">This page doesn't exist in the deck.</p>
      <Link to="/" className="px-5 py-2.5 rounded-xl bg-card-yellow text-felt-dark font-semibold hover:brightness-95 transition">
        Back home
      </Link>
    </div>
  )
}
