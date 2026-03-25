# Font trong dự án

Font được **tải và tối ưu tự động** bởi Next.js (`next/font/google`) khi chạy `npm run build` / `next dev` — không cần tải file `.ttf` thủ công.

| Vai trò | Font | Class Tailwind | Dùng cho |
|--------|------|----------------|----------|
| **Tiêu đề** | Plus Jakarta Sans | `font-heading` | `h1`–`h3`, logo chữ **ho Mã Nguồn**, tiêu đề trang |
| **Nội dung** | Inter | `font-body` | Đoạn văn, mô tả (mặc định trên `<body>`) |
| **Giao diện** | Manrope | `font-ui` | Menu, nút, nhãn, banner, footer section, input (`.pill-input`) |

## Cách dùng

```tsx
<h2 className="font-heading text-2xl font-bold">Tiêu đề</h2>
<p className="font-body text-slate-600">Đoạn văn.</p>
<button type="button" className="font-ui">Gửi</button>
```

Biến CSS: `--font-heading`, `--font-body`, `--font-ui` (gắn trên `<html>` trong `src/app/layout.tsx`).
