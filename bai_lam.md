# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- **Mã đề:** 01
- **Họ tên:** DOHONGKY
- **Lớp:** CNTT3
- **Link repository:** https://github.com/hongky06/DGNL-DHNN_BUOI_1
- **Hệ điều hành (Windows/macOS):** Windows
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`):** Chưa có commit P2 trong repository
- **Phiên bản Node.js (gõ `node -v`):** v24.21.0

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [x] 4.1.1. Bố cục trang
- [x] 4.1.2. Bảng sản phẩm
- [x] 4.1.3. Định dạng dữ liệu
- [x] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [x] 4.2.1. Tải danh sách
- [x] 4.2.2. Form thêm sản phẩm
- [x] 4.2.3. Gửi form
- [x] 4.2.4. Sửa sản phẩm
- [x] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [x] 4.3.1. Tìm kiếm và lọc
- [x] 4.3.2. Phân trang
- [x] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Chạy npm run api:cham.
2. Gõ lần lượt "b", "ba", "ban" vào ô tìm kiếm.
3. Chờ các request phản hồi.
```

Kết quả hiển thị:

```text
Với hook chưa sửa, request "ban" có thể được phản hồi chậm hơn request "ba" hoặc "b".
Danh sách có thể biến thành kết quả của một từ khoá cũ sau khi request cũ hoàn tất,
do đó giao diện không còn khớp với từ khoá mới nhất đang nhập.
```

Kết quả đúng:

```text
Danh sách chỉ hiển thị kết quả khớp với từ khoá mới nhất "ban".
Các request của "b" và "ba" phải bị huỷ và không được ghi đè state của request mới.
```

#### b) Vì sao hook hiển thị sai

Hook do AI sinh trong src/ai/useProductSearch_ai.js không tạo AbortController,
không huỷ request trước đó và không kiểm tra request nào vẫn còn hiện hành.
Các request hoàn tất không theo thứ tự tạo; ở chế độ api:cham, request "ban"
chậm 2,5 giây trong khi request "b" hoặc "ba" nhanh hơn. Vì vậy response của
request cũ có thể chạy sau request mới rồi ghi dữ liệu cũ vào state.

#### c) Hook đã sửa

Hook đã sửa nằm tại src/hooks/useProductSearch.js và được trang danh sách
sử dụng. Mỗi lần tham số thay đổi, hook tạo AbortController mới; effect cleanup
gọi controller.abort() để huỷ request cũ. Dữ liệu và lỗi chỉ được cập nhật khi
request chưa bị huỷ. Hook cũng giới hạn dữ liệu đúng trang và 10 sản phẩm/lần,
giữ loading, error và empty-state nhất quán.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI | Đoạn mã hoặc ý AI đưa ra (file) | Quyết định (giữ/sửa/loại bỏ) | Lý do | Bằng chứng kiểm chứng (chạy thử gì, kết quả) |
|---|---|---|---|---|---|
| 1 | "Xây dựng trang React cho danh sách, form thêm/sửa, API và routes" | Khung trang App.jsx, routes, xử lý form và các component | Sửa | Giữ cấu trúc React hợp lý nhưng tách danh sách, form, bảng/dòng và hook tìm kiếm; bổ sung data-testid, danh mục động và đồng bộ URL | Chạy `npm run tu-kiem-tra`: 3 test đạt; chạy `npm run build`: Vite build thành công |
| 2 | "Viết hook tìm kiếm và sửa lỗi dữ liệu cũ khi request chậm" | useEffect, axios, state data/total/loading/error | Sửa | Giữ useEffect và axios, thêm AbortController trong src/hooks/useProductSearch.js và kiểm tra `signal.aborted` trước khi cập nhật state | Chạy `npm run build` thành công; request cũ được huỷ khi tham số tìm kiếm hoặc bộ lọc thay đổi |
| 3 | "Hoàn thiện script build và kiểm tra lỗi URL biên" | Script `build` trong package.json và xử lý chuẩn hoá tham số trong ProductList.jsx | Giữ | Giữ script Vite build; thêm bỏ/chuẩn hoá q, page âm hoặc không hợp lệ; đã đọc và kiểm tra đoạn thay đổi trước khi dùng | Chạy `npm run build` thành công; smoke test API trả 10 sản phẩm và `total: 120` |

## Ghi chú (không tính điểm)

- Từ khoá chỉ gồm khoảng trắng được `.trim()` thành chuỗi rỗng và tham số `q` được xoá khỏi URL.
- URL có `page=-3`, `page=abc`, trang 0 hoặc trang không phải số nguyên đều được đưa về `page=1`.
- Khi trang lớn hơn tổng số trang thực tế, trang được điều chỉnh về trang cuối sau khi dữ liệu tải xong.
- Back/Forward được đọc lại qua `useSearchParams`, nên ô tìm kiếm, bộ lọc, trang và danh sách đồng bộ với URL.
