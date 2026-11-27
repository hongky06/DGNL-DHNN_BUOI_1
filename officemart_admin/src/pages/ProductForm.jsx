import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', category: '', price: '', stock: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/categories', { signal: controller.signal })
      .then((res) => setCategories(res.data))
      .catch(() => {});

    if (isEdit) {
      api.get(`/products/${id}`, { signal: controller.signal })
        .then((res) => {
          const p = res.data;
          setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, stock: p.stock, status: p.status });
        })
        .catch((err) => {
          setApiError(err.response?.status === 404 ? 'Không tìm thấy sản phẩm' : err.response?.data?.message || err.message);
        })
        .finally(() => setLoading(false));
    }
    return () => controller.abort();
  }, [id, isEdit]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  function validate() {
    const next = {};
    const name = form.name.trim();
    if (!name) next.name = 'Tên sản phẩm là bắt buộc';
    else if (name.length < 3 || name.length > 100) next.name = 'Tên sản phẩm từ 3 đến 100 ký tự';
    if (!form.sku) next.sku = 'SKU là bắt buộc';
    else if (!/^[A-Z]{3}-\d{4}$/.test(form.sku)) next.sku = 'SKU có dạng ABC-1234';
    if (!form.category) next.category = 'Vui lòng chọn danh mục';
    if (form.price === '' || !(Number(form.price) > 0)) next.price = 'Giá phải lớn hơn 0';
    if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      next.stock = 'Tồn kho là số nguyên không âm';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setApiError('');
    if (!validate()) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const body = { ...form, name: form.name.trim(), price: Number(form.price), stock: Number(form.stock) };
      if (isEdit) await api.put(`/products/${id}`, body);
      else await api.post('/products', body);
      navigate('/products', { state: { toast: isEdit ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm' } });
    } catch (err) {
      if (err.response?.status === 404) setApiError('Không tìm thấy sản phẩm');
      else if (err.response?.data?.field) {
        setErrors((current) => ({ ...current, [err.response.data.field]: err.response.data.message }));
      } else {
        setApiError(err.response?.data?.message || err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div data-testid="loading">Đang tải...</div>;

  return (
    <form className="product-form" data-testid="product-form" onSubmit={submit} noValidate>
      <h1>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
      {apiError && <div className="form-api-error">{apiError}</div>}
      <div className="form-field">
        <label htmlFor="name">Tên</label>
        <input id="name" name="name" value={form.name} onChange={updateField} />
        {errors.name && <div data-testid="field-error-name" className="field-error">{errors.name}</div>}
      </div>
      <div className="form-field">
        <label htmlFor="sku">SKU</label>
        <input id="sku" name="sku" value={form.sku} onChange={updateField} />
        {errors.sku && <div data-testid="field-error-sku" className="field-error">{errors.sku}</div>}
      </div>
      <div className="form-field">
        <label htmlFor="category">Danh mục</label>
        <select id="category" name="category" value={form.category} onChange={updateField}>
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {errors.category && <div data-testid="field-error-category" className="field-error">{errors.category}</div>}
      </div>
      <div className="form-field">
        <label htmlFor="price">Giá</label>
        <input id="price" name="price" type="number" value={form.price} onChange={updateField} />
        {errors.price && <div data-testid="field-error-price" className="field-error">{errors.price}</div>}
      </div>
      <div className="form-field">
        <label htmlFor="stock">Tồn kho</label>
        <input id="stock" name="stock" type="number" value={form.stock} onChange={updateField} />
        {errors.stock && <div data-testid="field-error-stock" className="field-error">{errors.stock}</div>}
      </div>
      <div className="form-field">
        <label htmlFor="status">Trạng thái</label>
        <select id="status" name="status" value={form.status} onChange={updateField}>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>
      <button type="submit" data-testid="submit-button" disabled={submitting}>
        {submitting ? 'Đang lưu...' : 'Lưu'}
      </button>
    </form>
  );
}
