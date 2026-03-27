# Font trong dự án

Bốn file `.woff2` trong `public/media/` được nạp qua `next/font/local` trong `src/app/layout.tsx` (mỗi vai trò **một file**, một `localFont` — tránh lặp weight gây lỗi).

| Vai trò   | File                         | Biến CSS       | Ghi chú ngắn        |
|-----------|------------------------------|----------------|---------------------|
| Tiêu đề   | `1a634e73dfeff02c-s.woff2`   | `--font-heading` | `h1`–`h6`, tiêu đề |
| Nội dung  | `1e41be92c43b3255-s.p.woff2` | `--font-body`    | `body`, đoạn văn   |
| Giao diện | `4120b0a488381b31-s.p.woff2` | `--font-ui`      | menu, nút, input   |
| Thương hiệu | `62c97acc3aa63787-s.p.woff2` | `--font-brand` | top-bar (thanh trên cùng) |

Class tiện ích: `.font-heading`, `.font-body`, `.font-ui`, `.font-brand`.

Logo trang **không dùng font làm wordmark** — chỉ ảnh `/brand/mark.svg`.
