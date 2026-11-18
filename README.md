# FinWise AI - Personal Financial Advisor System

FinWise AI is a comprehensive AI-powered personal financial advisor system that helps users manage their finances, get personalized investment recommendations, and receive daily financial briefings via email.

## 🌟 Features

- **AI-Powered Financial Analysis**: Google Gemini API provides personalized financial insights
- **Expense Tracking**: Categorize and visualize your monthly expenses
- **Investment Recommendations**: Get tailored investment advice based on your risk profile
- **Wealth Projections**: See your projected wealth over 1, 3, 5, and 10 years
- **Market Data**: Real-time Indian stock market data via Yahoo Finance
- **Daily Email Briefings**: Automated daily financial updates at 8 AM IST
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Database**: SQLite with better-sqlite3
- **AI Engine**: Google Gemini API (@google/generative-ai)
- **Authentication**: JWT (jsonwebtoken) + bcrypt (bcryptjs)
- **Email**: Nodemailer with Gmail SMTP
- **Stock Data**: yahoo-finance2
- **Scheduler**: node-cron for daily emails

### Frontend (React)
- **UI Framework**: React 18 with functional components
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 📁 Project Structure

```
finwise-ai/
├── server/
│   ├── db/
│   │   ├── database.js          # SQLite connection + initialization
│   │   └── finwise.db           # Auto-created SQLite file
│   ├── routes/
│   │   ├── auth.js              # Register, Login, Me
│   │   ├── analyze.js           # Gemini AI financial analysis
│   │   ├── profile.js           # Save/get financial profile
│   │   ├── email.js             # Subscribe/unsubscribe daily email
│   │   └── market.js            # Stock market data
│   ├── services/
│   │   ├── geminiService.js     # Gemini API integration + all prompts
│   │   ├── emailService.js      # Nodemailer daily email generation
│   │   ├── schedulerService.js  # node-cron daily job at 8AM
│   │   └── stockService.js      # yahoo-finance2 market data
│   ├── index.js                 # Express app entry point
│   ├── package.json
│   └── .env                     # Environment variables (create from .env.example)
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── OnboardingForm.jsx      # 4-step form
    │   │   ├── Dashboard.jsx           # Main dashboard
    │   │   └── charts/
    │   │       ├── ExpensePieChart.jsx
    │   │       ├── ProjectionLineChart.jsx
    │   │       └── AllocationBarChart.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx         # JWT storage + user state
    │   ├── services/
    │   │   └── api.js                  # Axios instance + all API calls
    │   └── App.jsx                     # React Router setup
    ├── package.json
    └── tailwind.config.js
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Gmail account (for email features)
- Google Gemini API key

### 1. Clone and Navigate

```bash
cd finwise-ai
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Required .env variables:**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
EMAIL_FROM_NAME=FinWise AI Advisor
```

**Getting a Gmail App Password:**
1. Go to Google Account Settings → Security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password to .env

**Getting a Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy to .env file

### 3. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Server will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create Tailwind config if not exists
npx tailwindcss init -p
```

### 5. Configure Tailwind CSS

Create `tailwind.config.js` in client folder:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6. Start Frontend

```bash
npm start
```

Frontend will start on `http://localhost:3000`

## 📊 Database Schema

The system uses SQLite with the following tables:

- **users**: User accounts and basic info
- **financial_profiles**: Income, expenses, and investment preferences
- **ai_analyses**: AI-generated financial analysis history
- **email_preferences**: Email subscription settings
- **email_logs**: Email sending history

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get financial profile
- `PUT /api/profile` - Update financial profile

### Analysis
- `POST /api/analyze` - Generate new AI analysis
- `GET /api/analyze/history` - Get analysis history
- `GET /api/analyze/latest` - Get latest analysis

### Market
- `GET /api/market/update` - Get market summary
- `GET /api/market/quote/:symbol` - Get specific stock quote

### Email
- `POST /api/email/subscribe` - Subscribe to daily emails
- `POST /api/email/unsubscribe` - Unsubscribe from emails
- `POST /api/email/test` - Send test email
- `GET /api/email/status` - Get email preferences

## 🎯 Usage Flow

1. **Register** at `/register`
2. **Complete Onboarding** (4-step form):
   - Personal information
   - Income details
   - Expense categories
   - Investment preferences
3. **View Dashboard** with:
   - Financial health score
   - Expense breakdown charts
   - Investment allocation
   - Wealth projections
   - Market data
   - Personalized recommendations
4. **Receive Daily Emails** at 8 AM IST (if subscribed)

## 🛠️ Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd client
npm start    # React development server
```

### Testing Email
Use the test endpoint to send a test email:
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| NODE_ENV | Environment mode | No |
| CLIENT_URL | Frontend URL | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| JWT_EXPIRES_IN | JWT expiration time | No (default: 7d) |
| GEMINI_API_KEY | Google Gemini API key | Yes |
| GMAIL_USER | Gmail address for sending emails | Yes |
| GMAIL_APP_PASSWORD | Gmail app password | Yes |
| EMAIL_FROM_NAME | Display name for emails | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Troubleshooting

### Backend won't start
- Check if PORT 5000 is available
- Verify all required .env variables are set
- Ensure SQLite has write permissions

### Emails not sending
- Verify Gmail App Password (not regular password)
- Check if "Less secure app access" is enabled or use App Password
- Review email_logs table for error details

### Gemini API errors
- Verify API key is valid
- Check API quota limits in Google AI Studio

### Frontend connection issues
- Ensure backend is running on correct port
- Check CLIENT_URL in .env matches frontend URL
- Verify CORS settings

## 📞 Support

For issues or questions, please open an issue on the repository or contact the development team.

---

Built with ❤️ using React, Node.js, and Google Gemini AI
