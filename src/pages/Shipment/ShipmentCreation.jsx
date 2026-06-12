import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, Send, Truck } from 'lucide-react';
import { api } from '../../services/api';

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
      toast.success(`Envío ${res.shipmentNumber || formData.shipmentNumber} creado exitosamente en Base de Datos.`);
      navigate(`/scanner?shipmentId=${res.id}`);
    } catch (error) {
      toast.error('Error de API: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--color-primary-glow)', borderRadius: '50%', color: 'var(--color-primary)' }}>
            <Truck size={28} />
          </div>
          <h1 className="text-primary" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', fontWeight: 700 }}>Nuevo Envío</h1>
        </div>
        <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Asigna la logística del vehículo y los equipos esperados.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 600 }}>Logística y Vehículo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">N° de Envío</label>
              <input required type="text" name="shipmentNumber" value={formData.shipmentNumber} className="input-field" onChange={handleChange} placeholder="Ej: ENV-001" />
            </div>
            <div className="input-group">
              <label className="input-label">Transportadora</label>
              <input required type="text" name="carrier" value={formData.carrier} className="input-field" onChange={handleChange} placeholder="Ej: Servientrega" />
            </div>
            <div className="input-group">
              <label className="input-label">Conductor</label>
              <input required type="text" name="driverName" value={formData.driverName} className="input-field" onChange={handleChange} placeholder="Nombre completo" />
            </div>
            <div className="input-group">
              <label className="input-label">Cédula Conductor</label>
              <input required type="text" name="driverDocument" value={formData.driverDocument} className="input-field" onChange={handleChange} placeholder="Documento ID" />
            </div>
            <div className="input-group">
              <label className="input-label">Placa del Vehículo</label>
              <input required type="text" name="vehiclePlate" value={formData.vehiclePlate} className="input-field" onChange={handleChange} placeholder="Ej: KZT999" />
            </div>
            <div className="input-group">
              <label className="input-label">Fecha Programada</label>
              <input required type="datetime-local" name="scheduledDate" value={formData.scheduledDate} className="input-field" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>Equipos Esperados</h3>
            <button type="button" onClick={addProduct} className="btn btn-glass">
              <Plus size={18} /> Añadir Equipo
            </button>
          </div>
          
          {products.map((prod, index) => (
            <div key={index} style={{ 
              display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem',
              background: 'var(--bg-surface-hover)', padding: '1.5rem', borderRadius: 'var(--radius-lg)'
            }}>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Nombre del Equipo</label>
                <input required placeholder="Ej: S25 Ultra" type="text" className="input-field" value={prod.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} />
              </div>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Modelo</label>
                <input required placeholder="Ej: SM-S938B" type="text" className="input-field" value={prod.model} onChange={(e) => handleProductChange(index, 'model', e.target.value)} />
              </div>
              <button 
                type="button" 
                onClick={() => removeProduct(index)} 
                className="btn btn-glass" 
                style={{ padding: '1rem', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)' }}
                disabled={products.length === 1}
              >
                <Trash2 size={24} />
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary w-full" style={{ padding: '1.25rem', fontSize: '1.2rem', boxShadow: '0 8px 30px var(--color-primary-glow)' }}>
          <Send size={24} /> Confirmar Creación de Envío
        </button>
      </form>
    </div>
  );
};

export default ShipmentCreation;
