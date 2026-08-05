import { Button, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ShoppingCartOutlined, InboxOutlined } from '@ant-design/icons'
import { colors, radius } from '../shared/theme'
import { useRoleStore } from '../features/role/model/roleStore'
import { MOCK_SCENARIOS, type Scenario } from '../features/scenarios/model/mockScenarios'

const ROLE_ICONS: Record<Scenario['role'], React.ReactNode> = {
  buyer: <ShoppingCartOutlined />,
  seller: <InboxOutlined />,
}

export default function TrainPage() {
  const navigate = useNavigate()
  const role = useRoleStore((s) => s.role)

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

  const scenarios = MOCK_SCENARIOS.filter((s) => s.role === role)

  return (
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
            gap: 16,
            flex: 1,
            overflowX: 'auto',
            paddingBottom: 16,
          }}
        >
          {scenarios.map((scenario) => (
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
              </div>

              <div
                style={{
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: colors.textMain, marginBottom: 4 }}>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}