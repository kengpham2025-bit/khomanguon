import { db } from "./src/lib/db";
import { sql } from "drizzle-orm";

async function clearSeedData() {
  try {
    await db.run(sql`DELETE FROM variants WHERE id LIKE 'var-%'`);
    await db.run(sql`DELETE FROM products WHERE id LIKE 'prod-%'`);
    await db.run(sql`DELETE FROM categories WHERE id LIKE 'cat-%'`);
    await db.run(sql`DELETE FROM users WHERE id LIKE 'seller-%'`);
    console.log("✅ Xóa thành công tất cả dữ liệu giả/sản phẩm ảo (seed data).");
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
  }
}

clearSeedData();
