import { useParams } from 'react-router-dom'
import { useRoleStore } from '../features/role/model/roleStore'
import { MOCK_SCENARIOS } from '../features/scenarios/model/mockScenarios'

export default function SimulatorPage() {
  const { id } = useParams()
  const role = useRoleStore((s) => s.role)
  const scenario = MOCK_SCENARIOS.find((s) => s.id === id)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      {scenario ? (
        <>
          <h2 style={{ marginBottom: 8 }}>{scenario.title}</h2>
          <p>
            {scenario.productTitle} · {scenario.price} · шагов: {scenario.steps.length} · роль:{' '}
            {role ?? '—'}
          </p>
          <p style={{ color: '#6b7280' }}>Экран чата в разработке</p>
        </>
      ) : (
        <p>Сценарий не найден</p>
      )}
    </div>
  )
}