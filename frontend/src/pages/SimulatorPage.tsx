import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Button, FloatButton } from 'antd'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DownOutlined,
  MoreOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { colors, radius } from '../shared/theme'
import { MOCK_SCENARIOS } from '../features/scenarios/model/mockScenarios'
import { startGame, stepGame, resumeGame } from '../shared/api/client'
import { mockGameStep, mockStartGame } from '../shared/api/mockGame'
import { ensureUserId } from '../shared/api/storage'
import type { GameFinal, GameOption, GameStepResponse } from '../shared/api/types'
import FadeIn from '../shared/ui/FadeIn'
import { useResultsStore } from '../features/results/model/resultsStore'

const GAME_SESSION_KEY = (scenarioId: string) => `antiscam_session_${scenarioId}`

function saveSession(scenarioId: string, sessionId: string) {
  localStorage.setItem(GAME_SESSION_KEY(scenarioId), sessionId)
}

function loadSession(scenarioId: string): string | null {
  return localStorage.getItem(GAME_SESSION_KEY(scenarioId))
}

function clearSession(scenarioId: string) {
  localStorage.removeItem(GAME_SESSION_KEY(scenarioId))
}

interface ChatMessage {
  id: number
  from: 'them' | 'me'
  text: string
  time: string
}

function nowTime() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const GAME_TIME_SEC = 15 * 60

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SimulatorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const scenario = MOCK_SCENARIOS.find((s) => s.id === id)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [current, setCurrent] = useState<GameStepResponse | null>(null)
  const [risk, setRisk] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [showDown, setShowDown] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SEC)
  const [timeUp, setTimeUp] = useState(false)
  const [runId, setRunId] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messageId = useRef(0)
  const addResult = useResultsStore((s) => s.addResult)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      const userId = await ensureUserId()
      try {
        let res: GameStepResponse | null = null
        const saved = loadSession(id)
        if (saved) {
          try {
            const r = await resumeGame(saved)
            if (!cancelled && r.is_over) {
              // Сессия уже завершена — показываем результат
              navigate(`/result/${r.session_id}`, { state: { scenarioId: id, final: r } })
              return
            }
            res = r
          } catch {
            // Сессия истекла или недоступна — начнём заново
            clearSession(id)
          }
        }
        if (!res) {
          res = await startGame({ scenario_id: id, user_id: userId })
        }
        if (cancelled) return
        if (res.is_over) return
        saveSession(id, res.session_id)
        setCurrent(res)
        setRisk(res.risk)
        setTimeLeft(GAME_TIME_SEC)
        setMessages([
          { id: ++messageId.current, from: 'them', text: res.question, time: nowTime() },
        ])
      } catch {
        const res = await mockStartGame(id)
        if (cancelled) return
        setCurrent(res)
        setRisk(res.risk)
        setTimeLeft(GAME_TIME_SEC)
        setMessages([
          { id: ++messageId.current, from: 'them', text: res.question, time: nowTime() },
        ])
      }
    })().catch(() => {
      if (!cancelled) setError(true)
    })
    return () => {
      cancelled = true
    }
  }, [id, runId, navigate])

  // Отсчёт времени на сценарий
  useEffect(() => {
    if (!current || current.is_over || timeUp) return
    const timer = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [current, timeUp])

  // Время вышло — блокируем ввод
  useEffect(() => {
    if (timeLeft === 0 && current && !current.is_over) setTimeUp(true)
  }, [timeLeft, current])

  const restart = () => {
    if (id) clearSession(id)
    setMessages([])
    setCurrent(null)
    setRisk(0)
    setError(false)
    setSending(false)
    setTimeUp(false)
    setTimeLeft(GAME_TIME_SEC)
    setRunId((r) => r + 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  if (!id) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>
        Сценарий не найден
      </div>
    )
  }

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowDown(el.scrollHeight - el.scrollTop - el.clientHeight > 80)
  }

  const handleSelect = async (option: GameOption) => {
    if (!current || current.is_over || sending || timeUp) return
    setSending(true)
    setMessages((prev) => [
      ...prev,
      { id: ++messageId.current, from: 'me', text: option.text, time: nowTime() },
    ])

    try {
      const res = await stepGame({ session_id: current.session_id, answer_id: option.id })
      setSending(false)
      if (res.is_over) {
        if (id) clearSession(id)
        finish(res)
      } else {
        if (id) saveSession(id, res.session_id)
        setCurrent(res)
        setRisk(res.risk)
        setMessages((prev) => [
          ...prev,
          { id: ++messageId.current, from: 'them', text: res.question, time: nowTime() },
        ])
      }
    } catch {
      try {
        const res = await mockGameStep(current.session_id, option.id)
        setSending(false)
        if (res.is_over) {
          finish(res)
        } else {
          setCurrent(res)
          setRisk(res.risk)
          setMessages((prev) => [
            ...prev,
            { id: ++messageId.current, from: 'them', text: res.question, time: nowTime() },
          ])
        }
      } catch {
        setSending(false)
        setError(true)
      }
    }
  }

  const finish = (final: GameFinal) => {
    if (id) clearSession(id)
    setCurrent(final)
    setRisk(final.risk)
    const score = Math.max(0, 100 - Math.min(100, final.risk))
    // AI-сценарий — разовая тренировка: результат показываем, но не сохраняем
    if (scenario) {
      addResult({
        scenarioId: id ?? '',
        scenarioTitle: scenario.title,
        score,
        grade: final.final_grade,
        createdAt: new Date().toISOString(),
        mistakes: final.mistakes,
        insights: final.insights,
      })
    }
    setTimeout(() => {
      navigate(`/result/${final.session_id}`, {
        state: { scenarioId: id ?? '', final },
      })
    }, 700)
  }

  const currentOptions = current && !current.is_over ? current.options : []

  return (
    <FadeIn>
      <div style={{ minHeight: '100vh', background: colors.heroBg }}>
        <div
          className="chat-column"
          style={{
            maxWidth: 720,
            margin: '0 auto',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: colors.heroBg,
          }}
        >
          <header
            style={{
              background: '#fff',
              borderBottom: `1px solid ${colors.border}`,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0,
            }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined style={{ fontSize: 18 }} />}
              onClick={() => navigate(-1)}
              style={{ color: colors.textMain }}
            />
            <Avatar size={40} style={{ background: colors.primary }} icon={<UserOutlined />} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: colors.textMain }}>
                  {scenario?.sellerName ?? 'Собеседник'}
                </span>
                <span style={{ color: colors.textSecondary, fontSize: 12 }}>
                  в сети {nowTime()}
                </span>
              </div>
              <div
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {scenario?.productTitle ?? 'Сценарий'} · {scenario?.price ?? ''}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: timeLeft <= 60 ? '#FEF2F2' : colors.cardBg,
                borderRadius: 999,
                padding: '4px 10px',
                flexShrink: 0,
              }}
            >
              <ClockCircleOutlined
                style={{
                  fontSize: 13,
                  color: timeLeft <= 60 ? colors.riskHigh : colors.textSecondary,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: timeLeft <= 60 ? colors.riskHigh : colors.textMain,
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 18 }} />}
              style={{ color: colors.textSecondary }}
            />
          </header>

          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${colors.riskLow} 0%, ${colors.riskMedium} 50%, ${colors.riskHigh} 100%)`,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `calc(${risk}% - 6px)`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#fff',
                border: `2px solid ${colors.textMain}`,
                transition: 'left 0.5s ease',
              }}
            />
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: 12,
                margin: '4px 0 8px',
              }}
            >
              Сегодня
            </div>

            {messages.map((msg) => {
              const isThem = msg.from === 'them'
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 8,
                    justifyContent: isThem ? 'flex-start' : 'flex-end',
                  }}
                >
                  {isThem && (
                    <Avatar
                      size={32}
                      style={{ background: colors.primary }}
                      icon={<UserOutlined />}
                    />
                  )}
                  <div style={{ maxWidth: '75%' }}>
                    <div
                      style={{
                        background: isThem ? colors.incomingBubble : colors.lightBlue,
                        borderRadius: isThem ? '4px 8px 8px 8px' : '8px 4px 8px 8px',
                        padding: '8px 12px',
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: colors.textMain,
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      {!isThem && (
                        <>
                          <CheckOutlined style={{ color: colors.primary, fontSize: 11 }} />
                          <CheckOutlined
                            style={{ color: colors.primary, fontSize: 11, marginLeft: -7 }}
                          />
                        </>
                      )}
                      <span style={{ color: colors.timestamp, fontSize: 11 }}>{msg.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              background: '#fff',
              borderTop: `1px solid ${colors.border}`,
              padding: '12px 16px',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {showDown && (
              <FloatButton
                icon={<DownOutlined />}
                onClick={scrollToBottom}
                style={{ position: 'absolute', right: 16, top: -56 }}
              />
            )}
            <div
              style={{
                textAlign: 'left',
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 10,
              }}
            >
              {timeUp ? 'Время вышло' : 'Выберите вариант ответа'}
            </div>
            {timeUp ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    background: '#FEF2F2',
                    borderRadius: radius.small,
                    padding: 12,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: colors.textMain,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <ClockCircleOutlined
                    style={{ color: colors.riskHigh, fontSize: 18, marginTop: 1 }}
                  />
                  <span>
                    <b>Время на сценарий истекло.</b>
                    <br />
                    Попытка не засчитана — попробуйте ещё раз или выберите другой сценарий.
                  </span>
                </div>
                <Button
                  type="primary"
                  block
                  shape="round"
                  style={{ borderRadius: 999, fontWeight: 700 }}
                  onClick={restart}
                >
                  Попробовать ещё раз
                </Button>
                <Button
                  block
                  shape="round"
                  style={{ borderRadius: 999 }}
                  onClick={() => navigate('/train')}
                >
                  К списку сценариев
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentOptions.map((option) => (
                  <Button
                    key={option.id}
                    block
                    shape="round"
                    type="default"
                    disabled={sending || !!error}
                    onClick={() => handleSelect(option)}
                    style={{
                      borderRadius: 999,
                      borderColor: colors.primary,
                      borderWidth: 1.5,
                      color: colors.primary,
                      background: '#fff',
                    }}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
