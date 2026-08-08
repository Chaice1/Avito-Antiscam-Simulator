import type {
  GameFinal,
  GameMistake,
  GameOption,
  GameStartResponse,
  GameStepResponse,
} from './types'

const Q1 =
  'Привет! Телефон ещё свободен. Чтобы забронировать, переведи аванс 5000₽ на карту — сразу отправлю доставку'
const Q1_OPTIONS: GameOption[] = [
  { id: 'ans_1_1', text: 'Переведу аванс на карту' },
  { id: 'ans_1_2', text: 'Оплата только через площадку' },
]

const Q2 =
  'Курьер уже выехал! Для подтверждения доставки нужен код из SMS, который тебе придёт. Продиктуй его'
const Q2_OPTIONS: GameOption[] = [
  { id: 'ans_2_1', text: 'Продиктую код' },
  { id: 'ans_2_2', text: 'Код не называю — это мошенники' },
]

const RISK_EXPLANATIONS: Record<string, string> = {
  ans_1_1:
    'Аванс на карту без гарантий — классическая схема обмана. Оплата — только через площадку.',
  ans_2_1: 'Код из SMS даёт доступ к твоим деньгам — его нельзя называть никому, даже «курьеру».',
}

interface MockSession {
  question: string
  options: GameOption[]
  risk: number
  choices: { answerId: string; answer: string; question: string }[]
}

const sessions = new Map<string, MockSession>()

function toMistakes(choices: MockSession['choices']): GameMistake[] {
  return choices
    .filter((c) => RISK_EXPLANATIONS[c.answerId])
    .map((c) => ({
      question: c.question,
      answer: c.answer,
      explanation: RISK_EXPLANATIONS[c.answerId],
    }))
}

export async function mockStartGame(scenarioId: string): Promise<GameStartResponse> {
  const sessionId = `mock-${scenarioId}-${Math.random().toString(36).slice(2, 8)}`
  sessions.set(sessionId, {
    question: Q1,
    options: Q1_OPTIONS,
    risk: 0,
    choices: [],
  })
  return {
    session_id: sessionId,
    title: 'Тестовый сценарий',
    role: 'buyer',
    risk: 0,
    is_over: false,
    question: Q1,
    options: Q1_OPTIONS,
  }
}

export async function mockGameStep(sessionId: string, answerId: string): Promise<GameStepResponse> {
  const session = sessions.get(sessionId)
  if (!session) throw new Error('session not found')

  const answer = session.options.find((o) => o.id === answerId)
  session.choices.push({
    answerId,
    answer: answer?.text ?? answerId,
    question: session.question,
  })

  if (answerId === 'ans_1_1') {
    session.risk += 70
    session.question = Q2
    session.options = Q2_OPTIONS
    return {
      session_id: sessionId,
      risk: session.risk,
      is_over: false,
      question: Q2,
      options: Q2_OPTIONS,
    }
  }

  if (answerId === 'ans_1_2') {
    session.question = Q2
    session.options = Q2_OPTIONS
    return {
      session_id: sessionId,
      risk: session.risk,
      is_over: false,
      question: Q2,
      options: Q2_OPTIONS,
    }
  }

  if (answerId === 'ans_2_1') {
    session.risk += 30
    const final: GameFinal = {
      session_id: sessionId,
      risk: session.risk,
      is_over: true,
      final_grade: 'Жертва мошенничества',
      mistakes: toMistakes(session.choices),
    }
    return final
  }

  const final: GameFinal = {
    session_id: sessionId,
    risk: session.risk,
    is_over: true,
    final_grade: session.risk >= 70 ? 'Чуть не попался' : 'Сделка безопасна',
    mistakes: toMistakes(session.choices),
  }
  return final
}
