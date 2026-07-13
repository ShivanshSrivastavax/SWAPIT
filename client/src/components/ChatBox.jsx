import { useState, useRef, useEffect } from 'react'

const QUICK_MESSAGES = ['Good luck!', 'SwapIt!', 'Nice one!', 'Good game!']

export default function ChatBox({ messages, onSend, currentUsername }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function submit(e) {
    e?.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-cream/10 bg-felt-dark/60 overflow-hidden">
      <div className="px-3 py-2 border-b border-cream/10 font-display font-bold text-sm">Room chat</div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-[8rem] max-h-64">
        {messages.length === 0 && <p className="text-cream/40 text-sm italic">No messages yet — say hi!</p>}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className={`font-semibold ${m.author === currentUsername ? 'text-card-yellow' : 'text-card-blue'}`}>
              {m.author}:
            </span>{' '}
            <span className="text-cream/90 break-words">{m.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-cream/10">
        {QUICK_MESSAGES.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            className="text-xs px-2 py-1 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="p-2 flex gap-2 border-t border-cream/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          className="flex-1 rounded-lg bg-cream/10 px-3 py-1.5 text-sm placeholder:text-cream/40 focus-ring"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-card-yellow text-felt-dark text-sm font-semibold hover:brightness-95"
        >
          Send
        </button>
      </form>
    </div>
  )
}
