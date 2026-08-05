import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Layout from './app/Layout'
import LandingPage from './pages/LandingPage'
import TrainPage from './pages/TrainPage'
import SimulatorPage from './pages/SimulatorPage'
import { colors } from './shared/theme'

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colors.primary,
            colorText: colors.textMain,
            colorTextSecondary: colors.textSecondary,
            colorBorder: colors.border,
            borderRadius: 16,
          },
        }}
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/train/:id" element={<SimulatorPage />} />
          </Route>
        </Routes>
      </ConfigProvider>
    </BrowserRouter>
  )
}
