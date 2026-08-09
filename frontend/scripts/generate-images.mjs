// Генерирует картинки для сценариев через YandexART (Yandex Cloud):
// 1) POST /foundationModels/v1/imageGenerationAsync -> id операции
// 2) GET  /operations/{id} до done -> base64 картинки
// Авторизация: Api-Key (YANDEX_API_KEY), модель: art://<папка>/yandex-art/latest.
// Запуск:  $env:YANDEX_API_KEY="AQVN..." ; npm run images

import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const API_KEY = process.env.YANDEX_API_KEY
const FOLDER_ID = process.env.YANDEX_FOLDER_ID || 'b1gnbqpl0e7gn5m3ai9f'
const MODEL = process.env.YANDEX_MODEL || 'yandex-art/latest'
const BASE_URL = 'https://llm.api.cloud.yandex.net'
const OUT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/assets/scenarios',
)

if (!API_KEY) {
  console.error('Нет ключа: задай YANDEX_API_KEY')
  process.exit(1)
}

const STYLE = 'flat vector illustration, blue and white colors, no text, no letters'

const SCENARIOS = [
  {
    id: 'buyer_iphone',
    prompt: `a man holding a new iPhone in a smartphone box, buying second hand online, ${STYLE}`,
  },
  {
    id: 'tenant_flat',
    prompt: `a person with keys in hand looking at apartment photos on a laptop, ${STYLE}`,
  },
  {
    id: 'seller_card',
    prompt: `a man holding a bank card next to a stack of winter tires, selling tires online, ${STYLE}`,
  },
  {
    id: 'seller_gpu',
    prompt: `a man holding a large graphics card in his hands, gaming computer on a desk, ${STYLE}`,
  },
]

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Api-Key ${API_KEY}`,
}

async function generate(prompt) {
  const modelUri = `art://${FOLDER_ID}/${MODEL}`
  const run = await fetch(`${BASE_URL}/foundationModels/v1/imageGenerationAsync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ modelUri, messages: [{ text: prompt }] }),
  })
  if (!run.ok) {
    const body = await run.text().catch(() => '')
    throw new Error(`run returned ${run.status}: ${body.slice(0, 400)}`)
  }
  const { id } = await run.json()
  if (!id) throw new Error('нет id операции')

  for (let attempt = 0; attempt < 60; attempt++) {
    await new Promise((r) => setTimeout(r, 2000))
    const op = await fetch(`${BASE_URL}/operations/${id}`, { headers })
    if (!op.ok) throw new Error(`status returned ${op.status}`)
    const data = await op.json()
    if (data.done) {
      const image = data.response?.image
      if (!image) throw new Error(`нет image в ответе: ${JSON.stringify(data.response).slice(0, 300)}`)
      return Buffer.from(image, 'base64')
    }
  }
  throw new Error('таймаут ожидания операции')
}

await mkdir(OUT_DIR, { recursive: true })

for (const s of SCENARIOS) {
  console.log(`[${s.id}] generating via YandexART...`)
  try {
    const buf = await generate(s.prompt)
    const dest = path.join(OUT_DIR, `${s.id}.png`)
    await writeFile(dest, buf)
    console.log(`[${s.id}] saved ${path.relative(process.cwd(), dest)} (${(buf.length / 1024).toFixed(0)} KB)`)
  } catch (e) {
    console.error(`[${s.id}] FAILED: ${e.message}`)
  }
}
