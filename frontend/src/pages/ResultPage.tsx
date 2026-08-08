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
  const verdict =
    score >= 75 ? 'Идеально' : score >= 50 ? 'Хорошо' : score >= 25 ? 'Слабовато' : 'Опасно'

  return (
    <FadeIn>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textMain, marginBottom: 8 }}>
          {final.final_grade}
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 24 }}>
          Вердикт: {verdict}
        </p>

        <div
          style={{
            background: '#fff',
            border: `1px solid ${colors.border}`,
            borderRadius: radius.card,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>
            Эта попытка
          </div>
          <div style={{ fontWeight: 700, fontSize: 40, color: colors.textMain }}>{score}%</div>
        </div>

        {final.mistakes.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.textMain, marginBottom: 12 }}>
              Твои ошибки
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {final.mistakes.map((mistake, i) => (
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
                    {mistake.question}
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
                    {mistake.answer}
                  </div>
                  <div style={{ fontSize: 14, color: colors.textMain, lineHeight: 1.5 }}>
                    {mistake.explanation}
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
