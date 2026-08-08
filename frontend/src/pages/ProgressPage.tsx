import { Button, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { RiseOutlined } from '@ant-design/icons'
import { colors, radius } from '../shared/theme'
import { useResultsStore, type Attempt } from '../features/results/model/resultsStore'
import { MOCK_SCENARIOS } from '../features/scenarios/model/mockScenarios'
import FadeIn from '../shared/ui/FadeIn'

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Покупатель',
  seller: 'Продавец',
}

function scoreColor(score: number) {
  if (score >= 75) return colors.riskLow
  if (score >= 50) return colors.riskMedium
  return colors.riskHigh
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProgressPage() {
  const navigate = useNavigate()
  const best = useResultsStore((s) => s.best)
  const attempts = useResultsStore((s) => s.attempts)

  const roleStats = ['buyer', 'seller']
    .map((role) => {
      const ids = MOCK_SCENARIOS.filter((s) => s.role === role).map((s) => s.id)
      const items = attempts.filter((a) => ids.includes(a.scenarioId))
      if (items.length === 0) return null
      const scores = items.map((a) => a.score)
      return {
        role,
        count: items.length,
        best: Math.max(...scores),
        avg: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  return (
    <FadeIn>
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '32px 24px 64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <RiseOutlined style={{ color: colors.primary, fontSize: 22 }} />
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: colors.textMain }}>
            Прогресс
          </h1>
        </div>
        <div style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 24 }}>
          Ваши результаты в тренажере: лучшие попытки и история
        </div>

        {attempts.length === 0 ? (
          <div style={{ padding: '60px 0' }}>
            <Empty description="Пока нет ни одной попытки — самое время потренироваться">
              <Button
                type="primary"
                style={{ borderRadius: radius.small }}
                onClick={() => navigate('/train')}
              >
                К сценариям
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            {roleStats.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                {roleStats.map((stat) => (
                  <div
                    key={stat.role}
                    style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: radius.card,
                      padding: 16,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15, color: colors.textMain, marginBottom: 12 }}>
                      {ROLE_LABELS[stat.role]}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: colors.textSecondary, fontSize: 13 }}>Попыток</span>
                      <span style={{ color: colors.textMain, fontWeight: 600, fontSize: 13 }}>
                        {stat.count}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: colors.textSecondary, fontSize: 13 }}>Лучший результат</span>
                      <span
                        style={{
                          color: scoreColor(stat.best),
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {stat.best}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textSecondary, fontSize: 13 }}>В среднем</span>
                      <span style={{ color: colors.textMain, fontWeight: 600, fontSize: 13 }}>
                        {stat.avg}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: colors.textMain }}>
              По сценариям
            </h2>
            <div style={{ marginBottom: 28 }}>
              {MOCK_SCENARIOS.map((scenario) => {
                const result = best[scenario.id]
                const count = attempts.filter((a) => a.scenarioId === scenario.id).length
                return (
                  <div
                    key={scenario.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 16px',
                      borderBottom: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/train/${scenario.id}`)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: colors.textMain,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {scenario.title}
                      </div>
                      <div style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {ROLE_LABELS[scenario.role]} · {count} {count === 1 ? 'попытка' : count < 5 ? 'попытки' : 'попыток'}
                      </div>
                    </div>
                    {result ? (
                      <div style={{ width: 140 }}>
                        <div
                          style={{
                            height: 8,
                            borderRadius: 999,
                            background: colors.lightBlueBg,
                            overflow: 'hidden',
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${result.score}%`,
                              background: scoreColor(result.score),
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            fontSize: 13,
                            color: scoreColor(result.score),
                          }}
                        >
                          {result.score}%
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: colors.textSecondary, fontSize: 13 }}>Не пройден</div>
                    )}
                  </div>
                )
              })}
            </div>

            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: colors.textMain }}>
              История попыток
            </h2>
            <div>
              {attempts.map((attempt, i) => (
                <HistoryRow key={i} attempt={attempt} />
              ))}
            </div>
          </>
        )}
      </div>
    </FadeIn>
  )
}

function HistoryRow({ attempt }: { attempt: Attempt }) {
  const navigate = useNavigate()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/train/${attempt.scenarioId}`)}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: colors.lightBlueBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 13, color: scoreColor(attempt.score) }}>
          {attempt.score}%
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: colors.textMain,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {attempt.scenarioTitle}
        </div>
        <div style={{ color: colors.textSecondary, fontSize: 12 }}>
          {attempt.grade} · {formatDate(attempt.createdAt)}
        </div>
      </div>
    </div>
  )
}
