import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import HomeHub from './pages/home/HomeHub.jsx'
import ScanPod from './pages/scan/ScanPod.jsx'
import ChatbotPage from './pages/chatbot/ChatbotPage.jsx'
import BrewHistory from './pages/history/BrewHistory.jsx'
import RouteLoading from './components/RouteLoading.jsx'

// amCharts pulls in a lot of weight — load it only when someone actually
// visits /sensors instead of bundling it into every page's initial load.
const SensorsPage = lazy(() => import('./pages/sensors/SensorsPage.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomeHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <ScanPod />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brew-history"
            element={
              <ProtectedRoute>
                <BrewHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sensors"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoading />}>
                  <SensorsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
