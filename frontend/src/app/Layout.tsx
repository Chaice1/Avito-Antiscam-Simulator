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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Круглая плашка со щитом */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: colors.lightBlueBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SafetyCertificateFilled style={{ color: colors.primary, fontSize: 20 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: colors.textMain }}>
            Антискам тренажер
          </span>
        </Link>

        {/* Бейдж-пилюля уровня безопасности */}
        <Link
          to="/progress"
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
          <span style={{ color: colors.textSecondary, fontSize: 13 }}>
            Мой уровень безопасности
          </span>
        </Link>
      </Header>

      <Content style={{ padding: 0 }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
