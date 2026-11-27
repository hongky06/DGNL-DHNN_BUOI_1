import { Navigate, Route, Routes } from 'react-router-dom';
import ProductList from './pages/ProductList.jsx';
import ProductForm from './pages/ProductForm.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">OfficeMart Admin</header>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </div>
  );
}
