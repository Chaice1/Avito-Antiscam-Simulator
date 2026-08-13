import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { colors, radius } from '../shared/theme'
import type { GameFinal } from '../shared/api/types'
import FadeIn from '../shared/ui/FadeIn'

interface ResultState {
  scenarioId: string
  final: GameFinal
}

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const data = (location.state as ResultState | null) ?? null

  if (!data) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 48, textAlign: 'center' }}>
        <FadeIn>
          <p style={{ color: colors.textSecondary, marginBottom: 20 }}>Нет данных о попытке</p>
          <Button type="primary" onClick={() => navigate('/train')}>
            К списку сценариев
          </Button>
        </FadeIn>
      </div>
    )
  }

  const { scenarioId, final } = data
  const score = Math.max(0, 100 - Math.min(100, final.risk))

  return (
    <FadeIn>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textMain, marginBottom: 24 }}>
          {final.final_grade}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: radius.card,
              padding: 20,
            }}
          >
            <div style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>
              Эта попытка
            </div>
            <div style={{ fontWeight: 700, fontSize: 40, color: colors.textMain }}>{score}%</div>
          </div>
        </div>

        {final.insights && final.insights.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.riskLow, marginBottom: 12 }}>
              Правильные решения
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {final.insights.map((insight, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.card,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                    Ситуация
                  </div>
                  <div style={{ fontSize: 14, color: colors.textMain, marginBottom: 10 }}>
                    {insight.question}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                    Твой ответ
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: colors.riskLow,
                      marginBottom: 10,
                    }}
                  >
                    {insight.answer}
                  </div>
                  <div style={{ fontSize: 14, color: colors.textMain, lineHeight: 1.5 }}>
                    {insight.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {final.mistakes && final.mistakes.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.riskHigh, marginBottom: 12 }}>
              Твои ошибки
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {final.mistakes.map((tag, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.card,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                    Ситуация
                  </div>
                  <div style={{ fontSize: 14, color: colors.textMain, marginBottom: 10 }}>
                    {tag.question}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                    Твой ответ
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: colors.riskHigh,
                      marginBottom: 10,
                    }}
                  >
                    {tag.answer}
                  </div>
                  <div style={{ fontSize: 14, color: colors.textMain, lineHeight: 1.5 }}>
                    {tag.explanation || 'Без пояснения'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 24 }}>
            Ошибок нет — ты отлично справился!
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button
            type="primary"
            block
            style={{ borderRadius: radius.small, fontWeight: 700 }}
            onClick={() => navigate(`/train/${scenarioId}`)}
          >
            Попробовать снова
          </Button>
          <Button block style={{ borderRadius: radius.small }} onClick={() => navigate('/train')}>
            К списку сценариев
          </Button>
        </div>
      </div>
    </FadeIn>
  )
}
