// Дизайн-токены из утверждённой дизайн-спеки.
// Единственный источник правды: все экраны берут цвета/радиусы отсюда.

export const colors = {
  primary: '#00aaff', // основной синий: кнопки, акценты, заголовки
  alertBlue: '#00aaff', // синий alert-плашек (темнее основного)
  lightBlueBg: '#EFF6FF', // фон пилюль/бейджей
  yellowBg: '#FEF9C3', // фон обучающей плашки
  yellowText: '#92700F', // текст на жёлтой плашке
  cardBg: '#F5F5F5', // фон карточек-контейнеров
  border: '#E5E7EB', // тонкие границы
  textMain: '#111827', // почти чёрный
  textSecondary: '#6B7280', // серый
  lightBlue: '#cfedff',
  incomingBubble: '#F0F0F0', // фон входящих сообщений (собеседник)
  timestamp: '#9CA3AF', // таймстемпы и разделители дат
}

export const radius = {
  card: 16,
  pill: 999,
}

export const fonts = {
  titleWeight: 700,
  regularWeight: 400,
}
