# 🚀 NeuraCoin - Fintech Crypto Trading App

NeuraCoin is a modern, cross-platform fintech application built with React Native and Expo, designed to provide users with a seamless cryptocurrency trading and portfolio management experience.

![NeuraCoin Logo](https://img.shields.io/badge/NeuraCoin-Fintech%20App-6366F1)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB)
![Expo](https://img.shields.io/badge/Expo-54.0-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6)

## ✨ Features

### 🔐 **Authentication System**
- User registration and login
- Email verification flow
- Secure token-based authentication
- Profile management
- Secure storage for sensitive data

### 📱 **Cross-Platform Support**
- iOS (Native & Expo Go)
- Android (Native & Expo Go) 
- Web (Progressive Web App)

### 💰 **Crypto Features**
- Real-time cryptocurrency market data
- Portfolio tracking and management
- Transaction history
- Market analytics and insights
- Secure crypto wallet simulation

### 🎨 **Modern UI/UX**
- Dark theme with gradient designs
- Smooth animations and transitions
- Responsive design for all screen sizes
- Intuitive navigation with tab-based structure

### 🔧 **Technical Features**
- TypeScript for type safety
- State management with Zustand
- Local data persistence
- Toast notifications
- Pull-to-refresh functionality
- Offline-first architecture

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.19.4 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/NeuraCoin.git
cd NeuraCoin
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npx expo start
# or
expo start
```

4. **Run on device/simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## 🏗️ Project Structure

```
NeuraCoin/
├── app/                          # App routing (Expo Router v3)
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify.tsx
│   │   └── welcome.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx            # Home screen
│   │   ├── market.tsx           # Market data
│   │   ├── portfolio.tsx        # Portfolio management
│   │   ├── profile.tsx          # User profile
│   │   └── transactions.tsx     # Transaction history
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   └── features/                # Feature-specific components
├── lib/                         # Core utilities and services
│   ├── api/                     # API integrations
│   ├── database/                # Local storage
│   ├── services/                # Business logic
│   ├── store/                   # State management (Zustand)
│   └── utils/                   # Helper functions
├── types/                       # TypeScript type definitions
└── assets/                      # Static assets
```

## 🛠 Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand
- **Storage:** AsyncStorage + Expo SecureStore
- **UI:** React Native + Expo Linear Gradient
- **Icons:** Expo Vector Icons
- **API:** CoinGecko API (with fallback mock data)
- **Development:** Expo Go for rapid development

## 📦 Key Dependencies


### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.your-backend.com
EXPO_PUBLIC_CRYPTO_API_KEY=your_crypto_api_key
```

### Expo Configuration

The app is configured in `app.json`:

```json
{
  "expo": {
    "name": "NeuraCoin",
    "slug": "neuracoin",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"]
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📱 Building for Production

### iOS

```bash
# Build for iOS
expo build:ios

# Or with EAS Build
eas build --platform ios
```

### Android

```bash
# Build for Android
expo build:android

# Or with EAS Build
eas build --platform android
```

## 👨‍💻 Author

**Tushar Verma**
- GitHub: [@vtushar06](https://github.com/vtushar06)

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for continuous support
- Contributors and beta testers

---

Made with ❤️ by [Tushar Verma](https://github.com/vtushar06)
