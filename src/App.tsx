// import { Routes, Route } from 'react-router-dom';
// import { Home } from './pages/Home';
// import { Chat } from './pages/Chat';
// import { PropertyDetail } from './components/property/PropertyDetail3';
// import { Wishlist } from './pages/Wishlist';
// import { Compare } from './pages/Compare';
// import { Properties } from './pages/Properties';
// import { Profile } from './pages/Profile';
// import { Toaster } from 'react-hot-toast';
// import { Layout } from './components/layout/Layout';
// import { TokenProvider } from './components/TokenContext';
// import { AddProperty } from './pages/AddProperty';
// import { DeveloperRegistration } from './pages/DeveloperRegistration';
// import { DeveloperDashboard } from './pages/DeveloperDashboard';
// import { DeveloperProfile } from './pages/DeveloperProfile';
// import { ProtectedRoute } from './components/auth/ProtectedRoute';
// import { useEffect } from 'react';
// import { useAuthStore } from './store/authStore';
// import { LoginPage } from './components/auth/LoginPage';
// import { RegisterPage } from './components/auth/RegisterWithOTP';
// import { ModalProvider } from './components/LoginModalContext';
// import { LoginModal } from './components/LoginModal';
// import { News } from './pages/News';
// import { EditProperty } from './pages/EditProperty';
// import { Blogs } from './pages/Blogs';
// import { BlogPost } from './pages/BlogPost';
// import { EMICalculator } from './pages/EMICalculator';
// import { VaastuAnalyzer } from './pages/VaastuAnalyzer';
// import { HelmetProvider } from 'react-helmet-async';
// import NotFound from './pages/NotFound';
// // import { NotFound } from './pages/NotFound';

// function App() {
//   const { initializeSession } = useAuthStore();

//   useEffect(() => {
//     initializeSession();
//   }, [initializeSession]);

//   return (
//     <HelmetProvider>
//       <ModalProvider>
//         <TokenProvider>
//           <Layout>
//             <Routes>
//               {/* Public Routes */}
//               <Route path="/" element={<Home />} />
//               <Route path="/chat/:chatId" element={<Chat />} />
//               <Route path="/login" element={<LoginPage/> }/>
//               <Route path="/register" element={<RegisterPage/>} />
              
//               {/* SEO-friendly property routes */}
//               <Route path="/property/:id" element={<PropertyDetail />} />
//               <Route path="/property/:id/:slug" element={<PropertyDetail />} />
              
//               <Route path="/properties" element={<Properties />} />
//               <Route path="/developer/:id" element={<DeveloperProfile />} />
//               <Route path="/developer/register" element={<DeveloperRegistration />}/>
//               <Route path="/news" element={<News />} />
//               <Route path="/blogs" element={<Blogs />} />
//               <Route path="/blog/:slug" element={<BlogPost />} />
//               <Route path="/ai-emi-calculator" element={<EMICalculator />} />
//               <Route path="/ai-vaastu-analyzer" element={<VaastuAnalyzer />} />

//               {/* Protected Routes */}
//               <Route
//                 path="/wishlist"
//                 element={
//                   <ProtectedRoute>
//                     <Wishlist />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/compare"
//                 element={
//                   <ProtectedRoute>
//                     <Compare />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/profile"
//                 element={
//                   <ProtectedRoute>
//                     <Profile />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/developer/add-property"
//                 element={
//                   <ProtectedRoute>
//                     <AddProperty />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/developer/edit-property/:propertyId"
//                 element={
//                   <ProtectedRoute>
//                     <EditProperty />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/developer/dashboard"
//                 element={
//                   <ProtectedRoute>
//                     <DeveloperDashboard />
//                   </ProtectedRoute>
//                 }
//               />
              
//               {/* 404 Route */}
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//             <Toaster
//               position="top-center"
//               toastOptions={{
//                 style: {
//                   border: '2px solid #338af1',
//                   padding: '3px',
//                   borderRadius: '8px',
//                 },
//               }}
//             />
//             <LoginModal />
//           </Layout>
//         </TokenProvider>
//       </ModalProvider>
//     </HelmetProvider>
//   );
// }

// export default App;


import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { PropertyDetail } from './components/property/PropertyDetail3';
import { Wishlist } from './pages/Wishlist';
import { Compare } from './pages/Compare';
import { Properties } from './pages/Properties';
import { Profile } from './pages/Profile';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { TokenProvider } from './components/TokenContext';
import { AddProperty } from './pages/AddProperty';
import { DeveloperRegistration } from './pages/DeveloperRegistration';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { DeveloperProfile } from './pages/DeveloperProfile';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterWithOTP';
import { ModalProvider } from './components/LoginModalContext';
import { LoginModal } from './components/LoginModal';
import { News } from './pages/News';
import { EditProperty } from './pages/EditProperty';
import { Blogs } from './pages/Blogs';
import { BlogPost } from './pages/BlogPost';
import { EMICalculator } from './pages/EMICalculator';
import { VaastuAnalyzer } from './pages/VaastuAnalyzer';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from './pages/NotFound';

function App() {
  const { initializeSession } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Helper to wrap a page in Layout
  const withLayout = (page: React.ReactNode) => <Layout>{page}</Layout>;

  return (
    <HelmetProvider>
      <ModalProvider>
        <TokenProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={withLayout(<Home />)} />
            <Route path="/chat/:chatId" element={withLayout(<Chat />)} />
            <Route path="/login" element={withLayout(<LoginPage />)} />
            <Route path="/register" element={withLayout(<RegisterPage />)} />

            {/* SEO-friendly property routes */}
            <Route path="/property/:id" element={withLayout(<PropertyDetail />)} />
            <Route path="/property/:id/:slug" element={withLayout(<PropertyDetail />)} />
            <Route path="/properties" element={withLayout(<Properties />)} />
            <Route path="/developer/:id" element={withLayout(<DeveloperProfile />)} />
            <Route path="/developer/register" element={withLayout(<DeveloperRegistration />)} />
            <Route path="/news" element={withLayout(<News />)} />
            <Route path="/blogs" element={withLayout(<Blogs />)} />
            <Route path="/blog/:slug" element={withLayout(<BlogPost />)} />
            <Route path="/ai-emi-calculator" element={withLayout(<EMICalculator />)} />
            <Route path="/ai-vaastu-analyzer" element={withLayout(<VaastuAnalyzer />)} />

            {/* Protected Routes */}
            <Route
              path="/wishlist"
              element={
                withLayout(
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/compare"
              element={
                withLayout(
                  <ProtectedRoute>
                    <Compare />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/profile"
              element={
                withLayout(
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/developer/add-property"
              element={
                withLayout(
                  <ProtectedRoute>
                    <AddProperty />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/developer/edit-property/:propertyId"
              element={
                withLayout(
                  <ProtectedRoute>
                    <EditProperty />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/developer/dashboard"
              element={
                withLayout(
                  <ProtectedRoute>
                    <DeveloperDashboard />
                  </ProtectedRoute>
                )
              }
            />

            {/* 404 Route */}
            <Route path="*" element={withLayout(<NotFound />)} />
          </Routes>

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                border: '2px solid #338af1',
                padding: '3px',
                borderRadius: '8px',
              },
            }}
          />

          <LoginModal />
        </TokenProvider>
      </ModalProvider>
    </HelmetProvider>
  );
}

export default App;
