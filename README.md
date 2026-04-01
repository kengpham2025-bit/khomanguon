# KHOMANGUON.IO.VN

Premium Bilingual (VI/EN) Digital Marketplace - Source Codes, AI Accounts, Emails, Social Media Accounts, and MMO Services.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Convex (convex.dev)
- **Auth**: Clerk + Convex Adapter
- **UI**: Tailwind CSS, Shadcn UI, Framer Motion
- **Icons**: lucide-react
- **Email**: Resend API
- **Captcha**: Cloudflare Turnstile
- **Payment**: PayOS API
- **AI**: Groq API (Llama 3/Mixtral)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Set up Convex:
   ```bash
   npx convex dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── convex/           # Convex database schema and functions
│   ├── schema.ts     # Database schema
│   ├── products.ts   # Product queries/mutations
│   ├── users.ts      # User queries/mutations
│   ├── orders.ts     # Order queries/mutations
│   ├── chat.ts       # Real-time chat
│   ├── deposits.ts   # Deposit system
│   ├── withdrawals.ts # Withdrawal system
│   ├── seo.ts        # SEO settings
│   └── aiRewrite.ts  # AI article rewriting
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   │   ├── ProductCard/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   ├── Chat/
│   │   ├── auth/
│   │   └── admin/
│   ├── lib/          # Utilities
│   └── i18n.ts       # Internationalization
└── messages/         # Translation files
    ├── vi.json
    └── en.json
```

## Features

- Bilingual support (Vietnamese/English)
- Real-time chat system
- OTP verification for sensitive actions
- Affiliate system (1% commission)
- AI-powered news auto-blogger
- Admin panel with SEO settings
- PayOS payment integration
- KYC verification for sellers

## License

MIT License
