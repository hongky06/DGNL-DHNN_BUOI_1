import ProductRow from './ProductRow.jsx';

export default function ProductTable({ products = [], categoryNames = {}, onEdit, onDelete }) {
  return (
    <table className="product-table" data-testid="product-table">
      <thead>
        <tr>
          <th>Tên</th>
          <th>SKU</th>
          <th>Danh mục</th>
          <th>Giá</th>
          <th>Tồn kho</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            categoryNames={categoryNames}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}
