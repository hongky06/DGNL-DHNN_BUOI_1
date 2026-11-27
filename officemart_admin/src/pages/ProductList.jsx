import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import ProductTable from '../components/ProductTable.jsx';
import useProductSearch from '../hooks/useProductSearch.js';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const rawPage = Number(searchParams.get('page') || 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const q = (searchParams.get('q') || '').trim();
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const [searchInput, setSearchInput] = useState(q);
  const [categories, setCategories] = useState([]);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(location.state?.toast || '');
  const [refresh, setRefresh] = useState(0);
  const { data, total, loading, error } = useProductSearch({ q, category, status, page, refresh });

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    const rawQ = searchParams.get('q');
    if (rawQ !== null && rawQ !== q) {
      const next = new URLSearchParams(searchParams);
      if (q) next.set('q', q);
      else next.delete('q');
      setSearchParams(next, { replace: true });
    }
  }, [q, searchParams, setSearchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === q) return;
      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set('q', trimmed);
      else next.delete('q');
      next.set('page', '1');
      setSearchParams(next);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput, q, searchParams, setSearchParams]);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!Number.isInteger(rawPage) || rawPage < 1) {
      const next = new URLSearchParams(searchParams);
      next.set('page', '1');
      setSearchParams(next);
    }
  }, [rawPage, searchParams, setSearchParams]);

  useEffect(() => {
    if (loading || error) return;
    const totalPages = Math.max(1, Math.ceil(total / 10));
    if (page > totalPages) {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(totalPages));
      setSearchParams(next);
    }
  }, [page, total, loading, error, searchParams, setSearchParams]);

  function changeFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    next.set('page', '1');
    setSearchParams(next);
  }

  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  }

  async function confirmDelete() {
    if (!confirmProduct || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${confirmProduct.id}`);
      setConfirmProduct(null);
      setToast('Đã xoá sản phẩm');
      setRefresh((value) => value + 1);
    } finally {
      setDeleting(false);
    }
  }

  const categoryMap = {};
  categories.forEach((item) => { categoryMap[item.id] = item.name; });
  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <main className="admin-main">
      {toast && <div className="toast" data-testid="toast">{toast}</div>}
      <div className="page-heading">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          className="add-button"
          data-testid="add-button"
          onClick={() => navigate('/products/new')}
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="filters">
        <label>
          Tìm kiếm
          <input
            type="search"
            data-testid="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tên hoặc SKU"
          />
        </label>
        <label>
          Danh mục
          <select
            data-testid="category-filter"
            value={category}
            onChange={(event) => changeFilter('category', event.target.value)}
          >
            <option value="">Tất cả</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select
            data-testid="status-filter"
            value={status}
            onChange={(event) => changeFilter('status', event.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </label>
      </div>

      {loading && <div className="loading" data-testid="loading">Đang tải...</div>}
      {!loading && error && (
        <div className="error-box" data-testid="error-message">
          <p>{error}</p>
          <button type="button" data-testid="retry-button" onClick={() => setRefresh((value) => value + 1)}>
            Thử lại
          </button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="empty-state" data-testid="empty-state">Không có sản phẩm</div>
      )}
      {!loading && !error && data.length > 0 && (
        <ProductTable
          products={data}
          categoryNames={categoryMap}
          onEdit={(product) => navigate(`/products/${product.id}/edit`)}
          onDelete={(product) => setConfirmProduct(product)}
        />
      )}

      <div className="pagination" data-testid="pagination">
        <button type="button" data-testid="page-prev" disabled={page <= 1} onClick={() => changePage(page - 1)}>Trước</button>
        <span data-testid="page-current">{page} / {totalPages}</span>
        <button type="button" data-testid="page-next" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Sau</button>
      </div>

      {confirmProduct && (
        <div className="dialog-backdrop">
          <div className="confirm-dialog" data-testid="confirm-dialog" role="dialog" aria-modal="true">
            <p>Bạn có chắc muốn xoá sản phẩm này?</p>
            <button type="button" data-testid="confirm-no" onClick={() => setConfirmProduct(null)}>Huỷ</button>
            <button type="button" data-testid="confirm-yes" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Đang xoá...' : 'Đồng ý'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
