import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App as AntdApp, ConfigProvider, Spin } from 'antd'
import Layout from './app/Layout'
import LandingPage from './pages/LandingPage'
import { colors } from './shared/theme'

const TrainPage = lazy(() => import('./pages/TrainPage'))
const SimulatorPage = lazy(() => import('./pages/SimulatorPage'))
const ResultPage = lazy(() => import('./pages/ResultPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))

function PageFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.heroBg,
      }}
    >
      <Spin size="large" />
    </div>
  )
}

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
        <AntdApp>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/train/:id" element={<SimulatorPage />} />
              <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/train" element={<TrainPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/result/:attemptId" element={<ResultPage />} />
              </Route>
            </Routes>
          </Suspense>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  )
}
