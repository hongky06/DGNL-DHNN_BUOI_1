import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function useProductSearch(params) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const requestParams = {
          page: params.page,
          limit: 10,
        };
        if (params.q) requestParams.q = params.q;
        if (params.category) requestParams.category = params.category;
        if (params.status) requestParams.status = params.status;
        const res = await api.get('/products', {
          params: requestParams,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setData(res.data.data);
          setTotal(res.data.total);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm');
          setData([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [params.q, params.category, params.status, params.page, params.refresh]);

  return { data, total, loading, error };
}
