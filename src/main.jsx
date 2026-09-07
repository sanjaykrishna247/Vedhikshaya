import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { KashayaProvider } from './auth/KashayaContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import AdminRoute from './auth/AdminRoute.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import HomeHub from './pages/home/HomeHub.jsx'
import ChatbotPage from './pages/chatbot/ChatbotPage.jsx'
import BrewHistory from './pages/history/BrewHistory.jsx'
import HerbsLibrary from './pages/herbs/HerbsLibrary.jsx'
import KashayaDetail from './pages/herbs/KashayaDetail.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import RouteLoading from './components/RouteLoading.jsx'
import { PortalProvider } from './portal/PortalContext.jsx'
import PortalRoute from './portal/PortalRoute.jsx'
import { ToastHost } from './pages/portal/shared.jsx'
import { DashLangProvider } from './pages/dashboard/dashI18n.jsx'
import { BrewSimProvider } from './pages/dashboard/BrewSim.jsx'

// amCharts pulls in a lot of weight — load it only when someone actually
// visits /sensors instead of bundling it into every page's initial load.
const SensorsPage = lazy(() => import('./pages/sensors/SensorsPage.jsx'))
// jsQR adds real weight too — only needed on the scan page.
const ScanPod = lazy(() => import('./pages/scan/ScanPod.jsx'))

// Doctor / Patient portals — separate bundle, only pulled when used.
const DoctorDashboard = lazy(() => import('./pages/portal/doctor/DoctorDashboard.jsx'))
const PatientDetail = lazy(() => import('./pages/portal/doctor/PatientDetail.jsx'))
const BrewMonitor = lazy(() => import('./pages/portal/doctor/BrewMonitor.jsx'))
const DoctorChat = lazy(() => import('./pages/portal/doctor/DoctorChat.jsx'))
const PatientDashboard = lazy(() => import('./pages/portal/patient/PatientDashboard.jsx'))
const PatientCompliance = lazy(() => import('./pages/portal/patient/PatientCompliance.jsx'))
const PatientPrescription = lazy(() => import('./pages/portal/patient/PatientPrescription.jsx'))
const PatientSymptoms = lazy(() => import('./pages/portal/patient/PatientSymptoms.jsx'))
const PatientChat = lazy(() => import('./pages/portal/patient/PatientChat.jsx'))

const doctorRoute = (el) => (
  <PortalRoute role="doctor">
    <Suspense fallback={<RouteLoading />}>{el}</Suspense>
  </PortalRoute>
)
const patientRoute = (el) => (
  <PortalRoute role="patient">
    <Suspense fallback={<RouteLoading />}>{el}</Suspense>
  </PortalRoute>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <KashayaProvider>
          <DashLangProvider>
          <BrewSimProvider>
          <PortalProvider>
          <ToastHost>
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
                <Suspense fallback={<RouteLoading />}>
                  <ScanPod />
                </Suspense>
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
            path="/herbs"
            element={
              <ProtectedRoute>
                <HerbsLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/herbs/:slug"
            element={
              <ProtectedRoute>
                <KashayaDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
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

          {/* Doctor portal */}
          <Route path="/doctor/dashboard" element={doctorRoute(<DoctorDashboard />)} />
          <Route path="/doctor/patient/:id" element={doctorRoute(<PatientDetail />)} />
          <Route path="/doctor/brew" element={doctorRoute(<BrewMonitor />)} />
          <Route path="/doctor/chat" element={doctorRoute(<DoctorChat />)} />

          {/* Patient portal */}
          <Route path="/patient/dashboard" element={patientRoute(<PatientDashboard />)} />
          <Route path="/patient/compliance" element={patientRoute(<PatientCompliance />)} />
          <Route path="/patient/prescription" element={patientRoute(<PatientPrescription />)} />
          <Route path="/patient/symptoms" element={patientRoute(<PatientSymptoms />)} />
          <Route path="/patient/chat" element={patientRoute(<PatientChat />)} />
          </Routes>
          </ToastHost>
          </PortalProvider>
          </BrewSimProvider>
          </DashLangProvider>
        </KashayaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
