import { useEffect, useState } from 'react'
import { Button, Empty, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCartOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { colors, radius } from '../shared/theme'
import { useRoleStore } from '../features/role/model/roleStore'
import { MOCK_SCENARIOS, type Scenario } from '../features/scenarios/model/mockScenarios'
import { generateAI, getScenarios } from '../shared/api/client'
import { mockGenerateAI } from '../shared/api/mockGame'
import { ensureUserId } from '../shared/api/storage'
import FadeIn from '../shared/ui/FadeIn'
import { useResultsStore } from '../features/results/model/resultsStore'

const ROLE_ICONS: Record<Scenario['role'], React.ReactNode> = {
  buyer: <ShoppingCartOutlined />,
  seller: <InboxOutlined />,
}

export default function TrainPage() {
  const navigate = useNavigate()
  const role = useRoleStore((s) => s.role)
  const results = useResultsStore((s) => s.best)
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const handleGenerate = async (scenarioId: string) => {
    setGeneratingId(scenarioId)
    try {
      const userId = await ensureUserId()
      const res = await generateAI({ scenario: scenarioId, user_id: userId })
      navigate(`/train/${res.scenario_id}`)
    } catch {
      const res = await mockGenerateAI(scenarioId)
      navigate(`/train/${res.scenario_id}`)
    } finally {
      setGeneratingId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getScenarios(role ?? undefined)
        if (cancelled) return
        setScenarios(
          res.scenarios.map((s) => {
            const extra = MOCK_SCENARIOS.find((m) => m.id === s.scenario_id)
            return {
              id: s.scenario_id,
              title: s.title,
              role: s.role,
              productTitle: extra?.productTitle ?? s.title,
              price: extra?.price ?? '',
              sellerName: extra?.sellerName ?? 'Собеседник',
              description: extra?.description ?? '',
              image: extra?.image,
            }
          }),
        )
      } catch {
        if (!cancelled) setScenarios(MOCK_SCENARIOS)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [role])

  if (!role) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 60 }}>
        <Empty description="Сначала выбери роль на главной">
          <Button type="primary" onClick={() => navigate('/')}>
            На главную
          </Button>
        </Empty>
      </div>
    )
  }

  if (!scenarios) {
    return (
      <div
        style={{
          background: colors.heroBg,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  const roleScenarios = scenarios.filter((s) => s.role === role)

  return (
    <FadeIn>
      <div
        style={{
          background: colors.heroBg,
          minHeight: 'calc(100vh - 64px)',
          padding: '24px 16px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textMain, marginBottom: 8 }}>
            Сценарии
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 24 }}>
            Выберите сценарий для тренировки
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 13,
              color: colors.textSecondary,
              marginBottom: 20,
            }}
          >
            <SafetyCertificateOutlined style={{ color: colors.primary }} />
            <span>Процент безопасности — насколько безопасно прошла сделка</span>
            <span style={{ color: colors.riskLow }}>● 75–100%</span>
            <span style={{ color: colors.riskMedium }}>● 50–74%</span>
            <span style={{ color: colors.riskHigh }}>● 0–49%</span>
          </div>

          {roleScenarios.length === 0 ? (
            <Empty description="Сценариев для этой роли пока нет" />
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 16,
                flex: 1,
                overflowX: 'auto',
                paddingBottom: 16,
              }}
            >
              {roleScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  style={{
                    minWidth: 220,
                    maxWidth: 260,
                    width: 'clamp(210px, 19vw, 260px)',
                    flex: '1 1 220px',
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.card,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: 'stretch',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minHeight: 140,
                      background: colors.lightBlueBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      color: colors.primary,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {scenario.image ? (
                      <img
                        src={scenario.image}
                        alt={scenario.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      ROLE_ICONS[scenario.role]
                    )}
                    {results[scenario.id] && <ResultBadge score={results[scenario.id].score} />}
                  </div>

                  <div
                    style={{
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: colors.textMain,
                        marginBottom: 4,
                      }}
                    >
                      {scenario.title}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6 }}>
                      {scenario.productTitle} · {scenario.price}
                    </div>
                    <div
                      style={{
                        color: colors.textSecondary,
                        fontSize: 13,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {scenario.description}
                    </div>
                    <Button
                      type="primary"
                      block
                      style={{ borderRadius: radius.small, fontWeight: 700, marginTop: 'auto' }}
                      onClick={() => navigate(`/train/${scenario.id}`)}
                    >
                      Запуск
                    </Button>
                    <Button
                      block
                      icon={<ThunderboltOutlined />}
                      loading={generatingId === scenario.id}
                      disabled={generatingId !== null}
                      style={{ borderRadius: radius.small, marginTop: 8 }}
                      onClick={() => handleGenerate(scenario.id)}
                    >
                      Сгенерировать ИИ-вариант
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  )
}

function ResultBadge({ score }: { score: number }) {
  const background =
    score >= 75 ? colors.riskLow : score >= 50 ? colors.riskMedium : colors.riskHigh
  const textColor = score >= 75 || score < 50 ? '#FFFFFF' : '#111827'
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background,
        color: textColor,
        borderRadius: 999,
        padding: '2px 10px',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      {score}%
    </div>
  )
}
