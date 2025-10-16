import React, { Suspense, lazy } from 'react';
import Providers from './components/Providers';
import { CartProvider } from './contexts/CartContext';

import LoadingComponent from './components/ui/Loader';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';

const DashboardReserves = lazy(() => import('./pages/reserves'));
const DashboardAccount = lazy(() => import('./pages/account'));
const DashboardSettings = lazy(() => import('./pages/settings'));
const Reserve = lazy(() => import('./pages/reserve'));
const Extras = lazy(() => import('./pages/extras'));
const Booking = lazy(() => import('./pages/booking'));
const InProcessReservation = lazy(() => import('./pages/reserve-in-process'));
const SuccessReservation = lazy(() => import('./pages/SuccessReservation'));
const ServicesCategoryPage = lazy(() => import('./pages/ServicesCategoryPage'));
const BookComplaint = lazy(() => import('./pages/BookComplaint'));
const ContactUs = lazy(() => import('./pages/Contact'));
const PoliciesServices = lazy(() => import("./pages/PoliciesServices"));
const PoliciesPrivacy = lazy(() => import("./pages/PoliciesPrivacy"));
const About = lazy(() => import('./pages/about'));
const Home = lazy(() => import('./pages/home'));


import SignIn from './pages/signin';
import ForgotPassword from './pages/forgot-password';
import ValidateCode from './pages/validate-code';
import ChangePassword from './pages/change-password';
import ErrorPage from './pages/error';
import ValidateAccount from './pages/validate-account';


interface ProtectedRouteProps {
  isAllowed: boolean | undefined;
  redirectPath?: string;
  children?: React.ReactNode;
};

const ProtectedRoute = ({ isAllowed, redirectPath = '/signin', children }: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return (
    <Suspense fallback={<LoadingComponent isLoading={true} />}>
      {children ? children : <Outlet />}
    </Suspense>
  )
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingComponent isLoading={true} />;
  }

  return (
    <Routes>
      <Route path="/"
        element={
          <Suspense fallback={<LoadingComponent isLoading={true} />}>
            <Home />
          </Suspense>
        }
      />

      <Route path="/about"
        element={
          <Suspense fallback={<LoadingComponent isLoading={true} />}>
            <About />
          </Suspense>
        }
      />

      <Route path="/services/:slug"
        element={
          <Suspense fallback={<LoadingComponent isLoading={true} />}>
            <ServicesCategoryPage />
          </Suspense>
        }
      />

      <Route path="/booking"
        element={
          <Suspense fallback={<LoadingComponent isLoading={true} />}>
            <Booking />
          </Suspense>
        }
      />
      <Route path="/extras"
        element={
          <Suspense fallback={<LoadingComponent isLoading={true} />}>
            <Extras />
          </Suspense>
        }
      />

      <Route path="/complaints-book" element={
        <Suspense fallback={<LoadingComponent isLoading={true} />}>
          <BookComplaint />
        </Suspense>
      } />

      <Route path="/contact" element={
        <Suspense fallback={<LoadingComponent isLoading={true} />}>
          <ContactUs />
        </Suspense>
      } />

      <Route path="/reserve"
        element={
          <Suspense fallback={<LoadingComponent isLoading={true} />}>
            <Reserve />
          </Suspense>
        }
      />

      <Route path="/policies/services" element={
        <Suspense fallback={<LoadingComponent isLoading={true} />}>
          <PoliciesServices />
        </Suspense>
      } />

      <Route path="/policies/privacy" element={
        <Suspense fallback={<LoadingComponent isLoading={true} />}>
          <PoliciesPrivacy />
        </Suspense>
      } />



      <Route path="/signin" element={<ProtectedRoute redirectPath="/dashboard" isAllowed={user == null || user == undefined}><SignIn /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ProtectedRoute redirectPath="/dashboard" isAllowed={user == null || user == undefined}><ForgotPassword /></ProtectedRoute>} />
      <Route path="/validate-code" element={<ProtectedRoute redirectPath="/dashboard" isAllowed={user == null || user == undefined}><ValidateCode /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute redirectPath="/dashboard" isAllowed={user == null || user == undefined}><ChangePassword /></ProtectedRoute>} />
      <Route path="/validated-account" element={<ProtectedRoute redirectPath="/dashboard" isAllowed={user == null || user == undefined}><ValidateAccount /></ProtectedRoute>} />

      <Route path="/reserve-processing"
        element={
          <Suspense fallback={<LoadingComponent isLoading={true} />}>
            <InProcessReservation />
          </Suspense>
        }
      />



      <Route
        path="/dashboard/reserves"
        element={
          <ProtectedRoute
            isAllowed={!!user && user.role != undefined && (user.role == "CLIENT")}
          >
            <DashboardReserves />
          </ProtectedRoute>
        }
      />




      <Route
        path="/reserve-success"
        element={
          <ProtectedRoute
            isAllowed={!!user && user.role != undefined && (user.role == "CLIENT")}
          >
            <SuccessReservation />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard/account"
        element={
          <ProtectedRoute
            isAllowed={!!user && user.role != undefined && (user.role == "CLIENT")}
          >
            <DashboardAccount />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard/settings"
        element={
          <ProtectedRoute
            isAllowed={!!user && user.role != undefined && (user.role == "CLIENT")}
          >
            <DashboardSettings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<ErrorPage />} />

    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingComponent isLoading={true} />}>
      <AuthProvider>
        <CartProvider>
          <Providers>
            <Router>
              <AppRoutes />
            </Router>
          </Providers>
        </CartProvider>
      </AuthProvider>
    </Suspense>
  );
};

export default App
