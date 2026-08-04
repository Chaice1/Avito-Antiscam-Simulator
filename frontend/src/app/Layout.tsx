import { Layout } from 'antd'
import { StarFilled, SafetyCertificateFilled } from '@ant-design/icons'
import { Link, Outlet } from 'react-router-dom'
import { colors } from '../shared/theme'

const { Header, Content } = Layout

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#fff',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          height: 64,
          lineHeight: 'normal',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateFilled style={{ color: colors.primary, fontSize: 22 }} />
          <span style={{ fontWeight: 700, fontSize: 18, color: colors.textMain }}>
            Антискам тренажер
          </span>
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: colors.cardBg,
            borderRadius: 999,
            padding: '6px 14px',
          }}
        >
          <StarFilled style={{ color: colors.primary, fontSize: 13 }} />
          <span style={{ color: colors.textSecondary, fontSize: 13 }}>Мой уровень безопасности</span>
        </div>
      </Header>

      <Content style={{ padding: '32px 24px' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
