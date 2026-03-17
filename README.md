# SocialPulse Frontend

SocialPulse is a modern, high-performance social media frontend built with a focus on developer experience and premium aesthetics. It features a sleek, dark-mode interface with glassmorphism and smooth micro-animations.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## ✨ Key Features

- **Premium UI/UX**: Custom-built design system with glassmorphism, responsive layouts, and interactive components.
- **Robust Navigation**: Safe back-navigation logic that handles direct link entries gracefully.
- **Profile Management**: Full support for editing user profiles, including avatar/banner cropping and real-time cache busting.
- **Public Profiles**: Discoverable public profile pages at `/u/:username`.
- **Advanced Auth**: Integrated with a secure JWT-based authentication flow with refresh token rotation support.
- **Global Toast System**: Non-intrusive feedback for user actions.
- **Confirmation Modals**: Custom, consistent confirmation dialogues for destructive actions (logout, session revocation).

## 🛠️ Components & UI

The project includes a suite of reusable, high-quality components:
- `ConfirmModal`: Styled confirmation dialogues.
- `EditProfileModal`: Full-featured profile editor with image cropping.
- `Toast`: Global notification system.
- `useNavigateBack`: Smart navigation hook for safer user flows.
- `ImageCropper`: Integrated `react-easy-crop` for perfect profile photos.

## 🏁 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- Backend API running (SocialPulse Backend)

### Installation

1. Clone the repository and navigate to the directory.
2. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   *Ensure `VITE_API_BASE_URL` points to your backend.*

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Roadmap
- [ ] Posts API Integration (CRUD & Feeds)
- [ ] Real-time Notifications
- [ ] Direct Messaging
- [ ] Search functionality
