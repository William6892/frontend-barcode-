import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import ShipmentCreation from './pages/ShipmentCreation';
import Audit from './pages/Audit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública - siempre accesible */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas privadas - requieren token */}
        <Route path="/" element={
          <ProtectedRoute>
            <Scanner />
          </ProtectedRoute>
        } />
        
        <Route path="/scanner" element={
          <ProtectedRoute>
            <Scanner />
          </ProtectedRoute>
        } />
        
        <Route path="/shipment/create" element={
          <ProtectedRoute>
            <ShipmentCreation />
          </ProtectedRoute>
        } />
        
        <Route path="/audit" element={
          <ProtectedRoute>
            <Audit />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;