// pages/Shipment/ShipmentCreation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, Send, Truck, Package, Calendar, User, Car, Hash, Building2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import './ShipmentCreation.css';

const ShipmentCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shipmentNumber: '', carrier: '', driverName: '', driverDocument: '', vehiclePlate: '', vehicleModel: '', scheduledDate: ''
  });
  const [products, setProducts] = useState([{ name: '', model: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleProductChange = (index, field, value) => {
    const newProds = [...products];
    newProds[index][field] = value;
    setProducts(newProds);
  };

  const addProduct = () => setProducts([...products, { name: '', model: '' }]);
  const removeProduct = (index) => setProducts(products.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
        expectedProducts: products.filter(p => p.name.trim() !== '')
      };
      const res = await api.post('/Shipment', payload);
      toast.success(`✅ Envío ${res.shipmentNumber || formData.shipmentNumber} creado`);
      navigate(`/scanner?shipmentId=${res.id}`);
    } catch (error) {
      toast.error('❌ Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shipment-creation-wrapper">
      <div className="shipment-creation">
        {/* HEADER */}
        <header className="creation-header">
          <div className="header-badge">
            <div className="header-icon-wrapper">
              <Truck size={28} />
            </div>
            <div>
              <h1 className="header-title">Nuevo Envío</h1>
              <p className="header-subtitle">Asigna la logística y los equipos esperados</p>
            </div>
          </div>
          <div className="header-stats">
            <span className="stat-item">
              <Package size={16} />
              {products.length} equipos
            </span>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: LOGÍSTICA */}
          <div className="form-section glass-panel">
            <div className="section-header">
              <div className="section-icon">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="section-title">Logística y Vehículo</h3>
                <p className="section-subtitle">Datos del transporte y conductor</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">
                  <Hash size={14} className="input-icon" />
                  N° de Envío
                </label>
                <input 
                  required 
                  type="text" 
                  name="shipmentNumber" 
                  value={formData.shipmentNumber} 
                  className="input-field" 
                  onChange={handleChange} 
                  placeholder="Ej: ENV-001" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Building2 size={14} className="input-icon" />
                  Transportadora
                </label>
                <input 
                  required 
                  type="text" 
                  name="carrier" 
                  value={formData.carrier} 
                  className="input-field" 
                  onChange={handleChange} 
                  placeholder="Ej: Servientrega" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <User size={14} className="input-icon" />
                  Conductor
                </label>
                <input 
                  required 
                  type="text" 
                  name="driverName" 
                  value={formData.driverName} 
                  className="input-field" 
                  onChange={handleChange} 
                  placeholder="Nombre completo" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Hash size={14} className="input-icon" />
                  Cédula Conductor
                </label>
                <input 
                  required 
                  type="text" 
                  name="driverDocument" 
                  value={formData.driverDocument} 
                  className="input-field" 
                  onChange={handleChange} 
                  placeholder="Documento ID" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Car size={14} className="input-icon" />
                  Placa del Vehículo
                </label>
                <input 
                  required 
                  type="text" 
                  name="vehiclePlate" 
                  value={formData.vehiclePlate} 
                  className="input-field" 
                  onChange={handleChange} 
                  placeholder="Ej: KZT999" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Calendar size={14} className="input-icon" />
                  Fecha Programada
                </label>
                <input 
                  required 
                  type="datetime-local" 
                  name="scheduledDate" 
                  value={formData.scheduledDate} 
                  className="input-field" 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: EQUIPOS */}
          <div className="form-section glass-panel">
            <div className="section-header">
              <div className="section-icon">
                <Package size={18} />
              </div>
              <div>
                <h3 className="section-title">Equipos Esperados</h3>
                <p className="section-subtitle">Productos que llevará el envío</p>
              </div>
              <button 
                type="button" 
                onClick={addProduct} 
                className="btn-add-product"
              >
                <Plus size={18} /> Añadir Equipo
              </button>
            </div>
            
            <div className="products-container">
              {products.map((prod, index) => (
                <div key={index} className="product-card">
                  <div className="product-number">{index + 1}</div>
                  
                  <div className="product-fields">
                    <div className="input-group product-input">
                      <label className="input-label">Nombre del Equipo</label>
                      <input 
                        required 
                        placeholder="Ej: S25 Ultra" 
                        type="text" 
                        className="input-field" 
                        value={prod.name} 
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)} 
                      />
                    </div>
                    <div className="input-group product-input">
                      <label className="input-label">Modelo</label>
                      <input 
                        required 
                        placeholder="Ej: SM-S938B" 
                        type="text" 
                        className="input-field" 
                        value={prod.model} 
                        onChange={(e) => handleProductChange(index, 'model', e.target.value)} 
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => removeProduct(index)} 
                    className="btn-remove-product"
                    disabled={products.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BOTÓN FINAL */}
          <button 
            type="submit" 
            className="btn-submit"
            disabled={isSubmitting}
          >
            <Send size={20} />
            {isSubmitting ? 'Creando...' : 'Confirmar Creación de Envío'}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShipmentCreation;