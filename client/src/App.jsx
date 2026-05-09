import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'

// pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BrowseCrops from './pages/BrowseCrops'
import CropDetail from './pages/CropDetail'
import AddCrop from './pages/AddCrop'
import FarmerContracts from './pages/FarmerContracts'
import BuyerContracts from './pages/BuyerContracts'
import ContractDetail from './pages/ContractDetail'
import CropSenseAI from './pages/CropSenseAI'
import Cart from './pages/Cart'
import MarketPrices from './pages/MarketPrices'
import Profile from './pages/Profile'
import FAQ from './pages/Faq'

// components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* public routes */}
        <Route path='/'           element={<Home />} />
        <Route path='/login'      element={<Login />} />
        <Route path='/register'   element={<Register />} />
        <Route path='/crops'      element={<BrowseCrops />} />
        <Route path='/crop/:id'   element={<CropDetail />} />
        <Route path='/market'     element={<MarketPrices />} />
        <Route path='/faq'        element={<FAQ />} />

        {/* farmer only routes */}
        <Route path='/farmer/add-crop' element={
          <ProtectedRoute role='farmer'>
            <AddCrop />
          </ProtectedRoute>
        } />
        <Route path='/farmer/contracts' element={
          <ProtectedRoute role='farmer'>
            <FarmerContracts />
          </ProtectedRoute>
        } />

        {/* buyer only routes */}
        <Route path='/buyer/cart' element={
          <ProtectedRoute role='buyer'>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path='/buyer/contracts' element={
          <ProtectedRoute role='buyer'>
            <BuyerContracts />
          </ProtectedRoute>
        } />

        {/* both roles */}
        <Route path='/contract/:id' element={
          <ProtectedRoute>
            <ContractDetail />
          </ProtectedRoute>
        } />
        <Route path='/ai' element={
          <ProtectedRoute>
            <CropSenseAI />
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App