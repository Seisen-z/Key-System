import { Routes, Route } from 'react-router-dom'
import Changelog from './pages/Changelog'
import Home from './pages/Home'
import Premium from './pages/Premium'
import MyPremium from './pages/MyPremium'
import Legal from './pages/Legal'
import AdminRoute from './pages/AdminRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/legal/:kind" element={<Legal />} />
      <Route path="/terms" element={<Legal />} />
      <Route path="/tos" element={<Legal />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/my-premium" element={<MyPremium />} />
      <Route path="/premium/account" element={<MyPremium />} />
      <Route path="/premium" element={<Premium />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<AdminRoute />} />
    </Routes>
  )
}
