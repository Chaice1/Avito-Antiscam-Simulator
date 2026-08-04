import { Avatar, Button, Card, Col, Row } from 'antd'
import {
  RightOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  StarOutlined,
  GiftOutlined,
  BulbOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { colors, radius } from '../shared/theme'
import { useRoleStore, type Role } from '../features/role/model/roleStore'

const ROLES: { key: Role; icon: React.ReactNode; title: string; description: string }[] = [
  {
    key: 'buyer',
    icon: <ShoppingCartOutlined />,
    title: 'Покупатель',
    description: 'Обучись распознавать разводы при покупке товара',
  },
  {
    key: 'seller',
    icon: <TagsOutlined />,
    title: 'Продавец',
    description: 'Обучись распознавать разводы при продаже товара',
  },
]

const STATS = [
  { icon: <ClockCircleOutlined />, text: '3 минуты на сценарий' },
  { icon: <StarOutlined />, text: 'Реальные схемы мошенников' },
  { icon: <GiftOutlined />, text: 'Полностью бесплатно' },
]


export default function LandingPage() {
  const navigate = useNavigate()
  const setRole = useRoleStore((s) => s.setRole)

  const startTraining = (role: Role) => {
    setRole(role)
    navigate('/train')
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* HERO */}
      <h1
        style={{
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 700,
          color: colors.primary,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Тренируй безопасность
      </h1>
      <p
        style={{
          color: colors.textSecondary,
          textAlign: 'center',
          fontSize: 16,
          maxWidth: 520,
          margin: '0 auto 32px',
        }}
      >
        Пройди симуляцию сделки и научись распознавать 
        <br />
        мошенников до того, как потеряешь деньги
      </p>

      {/* ДЕМО-КАРТОЧКА ДИАЛОГА */}
      <Card
        style={{
          maxWidth: 560,
          margin: '0 auto 48px',
          border: `1px solid ${colors.border}`,
          borderRadius: radius.card,
          background: colors.cardBg,
        }}
        styles={{ body: { padding: 20 } }}
      >
        {/* Шапка карточки: аватар + название + статус онлайн */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Avatar size={36} style={{ background: colors.primary }}>
            П
          </Avatar>
          <span style={{ fontWeight: 700, color: colors.textMain, flex: 1 }}>
            Продавец iPhone 15
          </span>
          <span
            style={{
              background: colors.lightBlueBg,
              color: colors.primary,
              fontSize: 12,
              padding: '2px 10px',
              borderRadius: radius.pill,
            }}
          >
            онлайн
          </span>
        </div>

        {/* Сообщение собеседника */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
          <Avatar size={28} style={{ background: colors.primary, fontSize: 13 }}>
            П
          </Avatar>
          <div
            style={{
              background: colors.incomingBubble,
              borderRadius: 12,
              padding: '10px 14px',
              maxWidth: '85%',
            }}
          >
            Переведи аванс 5000₽ на карту, и я сразу отправлю телефон
          </div>
        </div>

        {/* Свой ответ: пузырь справа + таймстемп + галочки */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: colors.lightBlue,
              borderRadius: 12,
              padding: '10px 14px',
              maxWidth: '85%',
            }}
          >
            Оплата только через площадку
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 4,
              fontSize: 12,
              color: colors.timestamp,
            }}
          >
            12:45
            <CheckOutlined style={{ color: colors.primary, fontSize: 10 }} />
            <CheckOutlined style={{ color: colors.primary, fontSize: 10, marginLeft: -4 }} />
          </div>
        </div>

        {/* Твои варианты */}
        <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
          Варианты ответа:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <Button shape="round" type="default" block>
            Переведу аванс на карту
          </Button>
          <Button
            shape="round"
            type="default"
            block
            style={{ borderColor: colors.primary, color: colors.primary, background: colors.lightBlueBg }}
          >
            Оплата только через площадку
          </Button>
          <Button shape="round" type="default" block>
            Заблокирую чат
          </Button>
        </div>

        {/* Разбор в конце */}
        <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
          Разбор в конце:
        </div>
        {/* Синий alert: распознанный риск */}
        <div
          style={{
            background: colors.lightBlue,
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            marginBottom: 12,
            marginLeft: 44,
            maxWidth: 'calc(100% - 44px)',
          }}
        >
          <WarningOutlined style={{ color: '#FACC15', fontSize: 18, marginTop: 2 }} />
          <span style={{ fontSize: 14, lineHeight: 1.5 }}>
            <b>Внимание:</b> предоплата без гарантий — классическая схема обмана
          </span>
        </div>

        {/* Жёлтая обучающая пилюля */}
        <div
          style={{
            background: colors.yellowBg,
            color: colors.yellowText,
            borderRadius: radius.pill,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 14,
            width: 'fit-content',
            margin: '0 auto',
          }}
        >
          <BulbOutlined style={{ color: colors.yellowText }} /> Тренажер распознал мошенническую схему
        </div>
      </Card>

      {/* ВЫБОР РОЛИ */}
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: colors.textMain,
          marginBottom: 12,
        }}
      >
        Выберите роль
      </h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        {ROLES.map((role) => (
          <Col xs={24} sm={12} key={role.key}>
            <Card
              hoverable
              style={{ background: colors.cardBg, borderRadius: radius.card }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ fontSize: 30, color: colors.primary, marginBottom: 12 }}>{role.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: colors.textMain, marginBottom: 4 }}>
                {role.title}
              </div>
              <div
                style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16, minHeight: 36 }}
              >
                {role.description}
              </div>
              <Button
                type="primary"
                shape="round"
                block
                icon={<RightOutlined />}
                onClick={() => startTraining(role.key)}
              >
                Тренироваться
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* СТАТЫ-СЕКЦИЯ */}
      <div
        style={{
          background: colors.cardBg,
          borderRadius: radius.card,
          padding: 24,
        }}
      >
        <Row gutter={[16, 24]}>
          {STATS.map((stat) => (
            <Col xs={24} sm={8} key={stat.text}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: colors.lightBlueBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary,
                    fontSize: 18,
                  }}
                >
                  {stat.icon}
                </div>
                <span
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  {stat.text}
                </span>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}
