import type { Role } from '../../role/model/roleStore'

export interface ScenarioOption {
  id: string
  text: string
  risk: number
  explanation: string
  takeaway: string
}

export interface ScenarioStep {
  id: string
  message: string
  redFlags: string[]
  options: ScenarioOption[]
}

export interface Scenario {
  id: string
  title: string
  role: Role
  productTitle: string
  price: string
  sellerName: string
  description: string
  image?: string
  steps: ScenarioStep[]
}

const TEST_STEPS: ScenarioStep[] = [
  {
    id: 'step_1',
    message:
      'Привет! Телефон ещё свободен. Оплату за доставку нужно перевести отдельно — курьерская служба пришлёт код для подтверждения. Скинь номер карты, я скину реквизиты оплаты',
    redFlags: ['просит данные карты', 'оплата вне площадки'],
    options: [
      {
        id: 'opt_transfer_card',
        text: 'Переведу на карту курьера',
        risk: 70,
        explanation:
          'Перевод на карту вне площадки ничем не защищён: вернуть деньги при обмане не получится.',
        takeaway: 'Плати только через площадку',
      },
      {
        id: 'opt_platform_payment',
        text: 'Давай оформим оплату через площадку',
        risk: 0,
        explanation: 'Оплата через площадку защищает обе стороны: деньги придут после подтверждения получения.',
        takeaway: 'Проверяй оплату только внутри площадки',
      },
      {
        id: 'opt_send_card_number',
        text: 'Скину номер карты для оплаты доставки',
        risk: 85,
        explanation: 'Данные карты нельзя отправлять в чат: мошенник может списать деньги с карты.',
        takeaway: 'Карту не показываю никому',
      },
    ],
  },
  {
    id: 'step_2',
    message:
      'Курьер уже выехал, но чтобы активировать доставку, нужен код из SMS, который тебе придёт. Просто продиктуй его в чат',
    redFlags: ['просит код из SMS'],
    options: [
      {
        id: 'opt_read_code',
        text: 'Продиктую код',
        risk: 100,
        explanation: 'Код из SMS даёт доступ к твоему аккаунту или деньгам — это почти всегда финал схемы.',
        takeaway: 'Код из SMS никому не называю',
      },
      {
        id: 'opt_refuse_code',
        text: 'Не буду отправлять код — это мошенники',
        risk: 0,
        explanation: 'Код из SMS — секретная информация, её никто не имеет права спрашивать.',
        takeaway: 'Код из SMS никому не называю',
      },
      {
        id: 'opt_photo_code',
        text: 'Отправлю фото кода, чтобы не ошибиться',
        risk: 100,
        explanation: 'Фото кода — тот же слив кода, только с доказательством для мошенника.',
        takeaway: 'Код из SMS никому не называю',
      },
    ],
  },
  {
    id: 'step_3',
    message:
      'Ок, давай по-другому: скинь аванс 5000₽ на карту, и я сразу закажу доставку официально',
    redFlags: ['настаивает на предоплате', 'давит на сроки'],
    options: [
      {
        id: 'opt_send_advance',
        text: 'Переведу аванс',
        risk: 70,
        explanation: 'Аванс на карту без гарантий — классическая схема: после перевода собеседник исчезает.',
        takeaway: 'Плати только через площадку',
      },
      {
        id: 'opt_pay_on_receipt',
        text: 'Не переведу — оплата только после получения',
        risk: 5,
        explanation: 'Безопасная позиция: деньги переходят после проверки товара.',
        takeaway: 'Оплата после получения товара',
      },
      {
        id: 'opt_block_report',
        text: 'Заблокирую чат и пожалуюсь в поддержку',
        risk: 0,
        explanation: 'Прервать контакт с подозрительным собеседником и сообщить о нём — самое правильное решение.',
        takeaway: 'Сомнительные диалоги завершаю и жалуюсь',
      },
    ],
  },
]

const TEST_BASE: Omit<Scenario, 'id' | 'role'> = {
  title: 'Тестовый сценарий',
  productTitle: 'iPhone 15',
  price: '45 000 ₽',
  sellerName: 'Дмитрий',
  description: 'Продавец предлагает отправить товар курьером и просит предоплату на карту',
  steps: TEST_STEPS,
}

export const MOCK_SCENARIOS: Scenario[] = [
  ...Array.from({ length: 5 }, (_, i) => ({
    ...TEST_BASE,
    id: `test_buyer_${i + 1}`,
    role: 'buyer' as Role,
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    ...TEST_BASE,
    id: `test_seller_${i + 1}`,
    role: 'seller' as Role,
  })),
]
