import { CheckoutClient } from "@/components/CheckoutClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, cartItems, products, variants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: { locale?: string };
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/login");
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser) {
    redirect("/login");
  }

  // Fetch cart items
  const dbCartItems = await db
    .select({
      cartItem: cartItems,
      product: products,
      variant: variants,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(variants, eq(cartItems.variantId, variants.id))
    .where(eq(cartItems.userId, currentUser.id));

  const items = dbCartItems.map(({ cartItem, product, variant }) => {
    let demoImages: string[] = [];
    try { demoImages = JSON.parse(product.demoImages || "[]"); } catch {}
    
    return {
      _id: cartItem.id,
      productId: product.id,
      variantId: variant.id,
      quantity: cartItem.quantity,
      product: {
        titleVi: product.titleVi,
        titleEn: product.titleEn,
        demoImages,
      },
      variant: {
        labelVi: variant.labelVi,
        labelEn: variant.labelEn,
        price: variant.price,
      },
    };
  });

  const cartTotal = items.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <CheckoutClient
        items={items}
        userBalance={currentUser.balance}
        cartTotal={cartTotal}
        locale={locale}
        hasBankAccount={!!currentUser.bankAccountNumber}
        referralCode={currentUser.referralCode}
      />
    </div>
  );
}
