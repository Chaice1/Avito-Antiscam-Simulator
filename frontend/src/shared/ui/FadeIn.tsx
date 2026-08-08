import type { ReactNode } from 'react'

export default function FadeIn({ children }: { children: ReactNode }) {
  return <div style={{ animation: 'fadeIn 0.4s ease' }}>{children}</div>
}
