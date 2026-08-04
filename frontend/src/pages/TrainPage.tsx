import { Empty } from 'antd'
import { useRoleStore } from '../features/role/model/roleStore'

export default function TrainPage() {
  const role = useRoleStore((s) => s.role)
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Empty
        description={
          <span>
            Роль: <b>{role === 'buyer' ? 'Покупатель' : role === 'seller' ? 'Продавец' : 'не выбрана'}</b>.
            Список сценариев — в разработке.
          </span>
        }
      />
    </div>
  )
}
