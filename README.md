# TerminalZenk Panel

TerminalZenk is a powerful administrative panel and backend system designed for managing user subscriptions, keys, and automated payments.

## 🚀 Features

- **User Authentication**: Secure login system using JWT and Bcrypt.
- **Subscription Management**: Create and manage different subscription tiers (Daily, Weekly, Monthly).
- **Payment Integration**: Automated Pix payment processing via PixGo.
- **Key System**: Generate and validate access keys for users.
- **Discord Integration**: Real-time notifications via webhooks for payments and system events.
- **Real-time Updates**: Socket.io integration for live status updates.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Styling**: Vanilla CSS with modern aesthetics
- **Communication**: Socket.io, Axios

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/splexdev/-terminalzenk.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   APP_URL=https://terminalzenk.net
   ```
4. Start the server:
   ```bash
   npm start
   ```

## 📜 License

This project is licensed under the ISC License.
