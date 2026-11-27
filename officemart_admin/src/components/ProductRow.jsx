import { Link } from 'react-router-dom';
import { categoryNames as sampleCategoryNames } from '../data/sample.js';

export function formatPrice(value) {
  return `${Number(value).toLocaleString('vi-VN')} ₫`;
}

export default function ProductRow({ product, categoryNames = {}, onEdit, onDelete }) {
  const categoryName = categoryNames[product.category] || sampleCategoryNames[product.category] || product.category;

  return (
    <tr data-testid="product-row">
      <td data-label="Tên">{product.name}</td>
      <td data-label="SKU">{product.sku}</td>
      <td data-label="Danh mục">{categoryName}</td>
      <td data-label="Giá">{formatPrice(product.price)}</td>
      <td data-label="Tồn kho">
        {Number(product.stock) === 0 ? <span className="out-of-stock">Hết hàng</span> : product.stock}
      </td>
      <td data-label="Trạng thái">
        <span
          data-testid="product-status"
          className={`status ${product.status === 'active' ? 'status-active' : 'status-inactive'}`}
        >
          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td data-label="Thao tác" className="actions">
        {onEdit ? (
          <button type="button" className="edit-button" data-testid="edit-button" onClick={() => onEdit(product)}>
            Sửa
          </button>
        ) : (
          <Link className="edit-button" data-testid="edit-button" to={`/products/${product.id}/edit`}>Sửa</Link>
        )}
        {onDelete ? (
          <button type="button" className="delete-button" data-testid="delete-button" onClick={() => onDelete(product)}>
            Xoá
          </button>
        ) : (
          <button type="button" className="delete-button" data-testid="delete-button">Xoá</button>
        )}
      </td>
    </tr>
  );
}
