import { useState } from 'react'
import { Button, Col, Divider, Input, Row, message } from 'antd'
import {
  WarningOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  CheckOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { colors, radius } from '../shared/theme'
import { getUserId } from '../shared/api/storage'
import { useResultsStore } from '../features/results/model/resultsStore'
import { useRoleStore, type Role } from '../features/role/model/roleStore'
import { useUserStore } from '../features/user/model/userStore'
import { registerWithName } from '../shared/api/storage'
import FadeIn from '../shared/ui/FadeIn'

const ROLES: { key: Role; icon: React.ReactNode; title: string; description: string }[] = [
  {
    key: 'buyer',
    icon: <ShoppingCartOutlined />,
    title: 'Покупатель',
    description: 'Обучись распознавать разводы при покупке товара',
  },
  {
    key: 'seller',
    icon: <InboxOutlined />,
    title: 'Продавец',
    description: 'Обучись распознавать разводы при продаже товара',
  },
]

const STATS = [
  { icon: <ClockCircleOutlined />, text: '15 минут на сценарий' },
  { icon: <SearchOutlined />, text: 'Распознай схему мошенника' },
  { icon: <CheckOutlined />, text: 'Проверь свои решения' },
]

const DEMO_OPTIONS = [
  {
    id: 'advance',
    text: 'Переведу аванс на карту',
    risk: 70,
    title: 'Подозрительно!',
    explanation:
      'Аванс на карту без гарантий — классическая схема обмана. Оплата — только через площадку.',
  },
  {
    id: 'platform',
    text: 'Оплата только через площадку',
    risk: 10,
    title: 'Безопасно',
    explanation:
      'Оплата через площадку защищает обе стороны: деньги придут после подтверждения получения товара.',
  },
  {
    id: 'block',
    text: 'Заблокирую чат',
    risk: 5,
    title: 'Безопасно',
    explanation: 'Заблокировать диалог с подозрительным собеседником — надёжный выход из контакта.',
  },
]

function RiskBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, color: colors.textSecondary }}>Низкий риск</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.textMain }}>
          {Math.round(v)}%
        </span>
        <span style={{ fontSize: 12, color: colors.textSecondary }}>Высокий риск</span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 10,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${colors.riskLow} 0%, ${colors.riskMedium} 50%, ${colors.riskHigh} 100%)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `calc(${v}% - 7px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            border: `2px solid ${colors.textMain}`,
            transition: 'left 0.5s ease',
          }}
        />
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const setRole = useRoleStore((s) => s.setRole)
  const username = useUserStore((s) => s.username)
  const setUsername = useUserStore((s) => s.setUsername)
  const clearUsername = useUserStore((s) => s.clear)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [registering, setRegistering] = useState(false)

  const startTraining = (role: Role) => {
    setRole(role)
    navigate('/train')
  }

  const handleRegister = async () => {
    const name = nickname.trim()
    if (!name) {
      message.warning('Введите имя')
      return
    }
    const previousId = getUserId()
    setRegistering(true)
    try {
      await registerWithName(name)
      setUsername(name)
      // Новый пользователь — старый локальный прогресс не показываем
      if (previousId && previousId !== getUserId()) {
        useResultsStore.getState().clearProgress()
      }
      message.success(`Вы вошли как ${name}`)
    } catch {
      message.error('Не удалось зарегистрироваться — попробуйте позже')
    } finally {
      setRegistering(false)
    }
  }

  const selected = DEMO_OPTIONS.find((o) => o.id === selectedOption)

  return (
    <FadeIn>
      <div>
        {/* HERO */}
        <section style={{ background: colors.heroBg, padding: '44px 24px' }}>
          <Row gutter={[40, 32]} align="middle" style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Col xs={24} lg={12}>
              <h1
                style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 700,
                  color: colors.textMain,
                  lineHeight: 1.15,
                  marginBottom: 16,
                }}
              >
                Тренируй безопасноть
              </h1>
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  maxWidth: '85%',
                  lineHeight: 1.6,
                }}
              >
                Пройди симуляцию сделки и научись распознавать
                <br />
                мошенников до того, как потеряешь деньги
              </p>
            </Col>

            {/* Демо-карточка */}
            <Col xs={24} lg={12}>
              <div
                style={{
                  background: '#fff',
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.card,
                  padding: 16,
                  maxWidth: 420,
                  margin: '0 auto',
                }}
              >
                {/* Верхняя строка: товар ↔ Онлайн */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontWeight: 700, color: colors.textMain }}>
                    Покупатель iPhone 15
                  </span>
                  <span style={{ color: colors.textSecondary, fontSize: 13 }}>Онлайн</span>
                </div>

                {/* Сообщение собеседника */}
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.msg,
                    padding: '10px 12px',
                    marginBottom: 12,
                  }}
                >
                  Переведи аванс 5000₽ на карту, и я сразу отправлю телефон
                </div>

                {/* Варианты ответа */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {DEMO_OPTIONS.map((option) => {
                    const isSelected = selectedOption === option.id
                    return (
                      <Button
                        key={option.id}
                        shape="round"
                        type="default"
                        block
                        onClick={() => setSelectedOption(option.id)}
                        style={{
                          borderRadius: radius.small,
                          ...(isSelected
                            ? {
                                borderColor: colors.primary,
                                color: colors.primary,
                                background: colors.lightBlueBg,
                              }
                            : {}),
                        }}
                      >
                        {option.text}
                      </Button>
                    )
                  })}
                </div>

                {/* Плашка результата */}
                {selected && (
                  <div
                    style={{
                      background: colors.yellowBg,
                      borderRadius: radius.small,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <WarningOutlined style={{ color: '#FACC15', fontSize: 18, marginTop: 1 }} />
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                        <b>{selected.title}</b>
                        <div style={{ fontWeight: 400 }}>{selected.explanation}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Полоса риска */}
                {selected && <RiskBar value={selected.risk} />}
              </div>
            </Col>
          </Row>
        </section>

        {/* ВХОД */}
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 0' }}>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: radius.card,
              padding: 16,
            }}
          >
            {username ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: colors.lightBlueBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.primary,
                      fontSize: 18,
                    }}
                  >
                    <UserOutlined />
                  </div>
                  <div>
                    <div style={{ color: colors.textSecondary, fontSize: 12 }}>Вы вошли как</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: colors.textMain }}>
                      {username}
                    </div>
                  </div>
                </div>
                <Button icon={<LogoutOutlined />} onClick={() => clearUsername()}>
                  Сменить пользователя
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: colors.lightBlueBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  <UserOutlined />
                </div>
                <Input
                  placeholder="Ваше имя"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onPressEnter={handleRegister}
                  maxLength={30}
                  style={{ maxWidth: 260 }}
                />
                <Button type="primary" loading={registering} onClick={handleRegister}>
                  Войти
                </Button>
                <span style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Зарегистрируйтесь, чтобы история попыток сохранялась
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ВЫБОР РОЛИ */}
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: colors.textMain,
              marginBottom: 20,
            }}
          >
            Выберите роль
          </h2>

          <Row gutter={[16, 16]}>
            {ROLES.map((role) => (
              <Col xs={24} lg={12} key={role.key}>
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.card,
                    padding: 20,
                    height: '100%',
                  }}
                >
                  {/* Иконка + заголовок */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: radius.small,
                        background: colors.iconSquareBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: '#374151',
                      }}
                    >
                      {role.icon}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 18, color: colors.textMain }}>
                      {role.title}
                    </span>
                  </div>

                  <div
                    style={{
                      color: colors.textSecondary,
                      fontSize: 14,
                      marginBottom: 16,
                      minHeight: 40,
                    }}
                  >
                    {role.description}
                  </div>

                  <Button
                    type="primary"
                    block
                    style={{ borderRadius: radius.small, fontWeight: 700 }}
                    onClick={() => startTraining(role.key)}
                  >
                    Тренироваться
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </section>

        {/* СТАТЫ */}
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 48px' }}>
          <Divider style={{ borderColor: colors.border }} />
          <Row gutter={[16, 24]}>
            {STATS.map((stat) => (
              <Col xs={24} sm={8} key={stat.text}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
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
                      color: colors.primary,
                      fontSize: 20,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <span style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
                    {stat.text}
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </section>
      </div>
    </FadeIn>
  )
}
