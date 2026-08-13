<div align="center">
  <img src="./assets/images/icon.png" width="120" height="120" alt="CarYaar Logo" />
  <h1>🚗 CarYaar</h1>
  <p><b>The smartest way to split carpool costs, track trips, and settle balances with friends.</b></p>
</div>

---

## 📖 About CarYaar
CarYaar is a modern React Native application designed to take the awkwardness out of splitting gas money. Whether you are commuting to work, going on a road trip, or just driving friends around town, CarYaar automatically calculates who owes what, tracks live routes, and lets you settle up instantly via UPI.

## ✨ Key Features
* 🗺️ **Live Trip Tracking**: Uses `expo-location` and Google Maps integrations to accurately track trip distances and routes in real-time.
* 💸 **Instant UPI Settlements**: Deep-linked payment integration allows riders to instantly settle their balances via Google Pay, PhonePe, or Paytm with one tap.
* 👥 **Group Management**: Create private groups, generate invite codes, and use deep links to seamlessly add friends to your carpools.
* 📊 **Smart Cost Splitting**: Automatically calculates balances. Only the passengers split the total trip cost, fairly compensating the driver.
* 🔒 **Secure & Real-time**: Powered by Supabase for lightning-fast real-time database updates, row-level security (RLS), and secure authentication.
* 🎨 **Beautiful UI**: Designed with a custom bold aesthetic using NativeWind (Tailwind CSS) and fluid micro-animations via React Native Reanimated.

## 🛠️ Tech Stack
* **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (Expo Router)
* **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
* **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
* **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) & HeroUI Native
* **Animations**: `react-native-reanimated`

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed
- Expo Go app on your mobile device (or an Android/iOS emulator)
- A Supabase account and project (for backend configuration)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/Phaze19/CarYaar.git
   cd CarYaar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the App**
   ```bash
   npx expo start
   ```
   Scan the QR code with the Expo Go app on your phone, or press `a` to run on an Android emulator.

## 📦 Building for Production
This app is configured to be built using [EAS (Expo Application Services)](https://expo.dev/eas).

To generate a production Android APK:
```bash
eas build -p android --profile preview
```

## 📜 License
This project is for personal use and beta testing. All rights reserved.
