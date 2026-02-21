# AlmaShop 🛍️

A premium e-commerce mobile application built with **React Native (Expo)**, featuring a "Heritage Modernity" design aesthetic inspired by Indonesian fabrics.

## 🚀 Tech Stack

- **Framework**: [Expo Router](https://docs.expo.dev/router/introduction/) (React Native)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Fonts**: Playfair Display (Headings) & Inter (Body)

## 🛠️ Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Backend Setup (Supabase)
This project uses Supabase for the database. You need to apply the SQL migrations to your project.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy and run the contents of `supabase/migrations/001_initial_schema.sql` to set up tables and RLS policies.
4. Copy and run `supabase/migrations/002_fix_rls_recursion.sql` to fix a known RLS issue.

### 4. Run the App
```bash
npx expo start
```
- Press `w` for Web.
- Press `a` for Android (requires Emulator or connected device).
- Press `i` for iOS (requires Simulator or Mac).

## 📂 Project Structure

```
d:/ALMA/
├── app/                 # Expo Router pages
│   ├── (auth)/          # Login/Register
│   ├── (tabs)/          # Main tabs (Home, Cart, Profile)
│   ├── product/         # Product details
│   ├── checkout/        # Checkout flow
│   └── order/           # Order history
├── components/          # Reusable UI components
├── constants/           # Theme tokens (colors, fonts)
├── lib/                 # Supabase client & utilities
├── store/               # Zustand state management
├── services/            # API service layers
└── supabase/migrations/ # SQL schema files
```

## ✨ Key Features

- **Heritage Modernity UI**: Custom colors (Deep Brown `#4E342E`, Gold `#D4AF37`) and typography.
- **Full Shopping Flow**: Browse -> Search -> Product Detail -> Cart -> Checkout -> Order History.
- **Real-time Data**: Products, Categories, and Orders managed via Supabase.
- **Persistent Cart**: Cart items saved locally.
- **Search**: Debounced product search with filtering.

## 🧪 Testing

To verify your Supabase connection:
```bash
node scripts/test-supabase.js
```
