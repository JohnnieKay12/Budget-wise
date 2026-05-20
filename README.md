# BudgetWise - Your Smart Money Companion

A complete full-stack expense tracking and spending management application built with the MERN stack.

## Features

- **Dashboard** - Real-time financial overview with charts and analytics
- **Expense Tracking** - Full CRUD operations with Nigerian categories (Transport, Bolt/Uber, Food & Jollof, Generator Fuel, POS Charges, Airtime, Data, Family Support, Church Offering, Rent, NEPA Bills, etc.)
- **Budget Management** - Set spending limits with alerts and tracking
- **Savings Goals** - Create goals with milestones and progress tracking
- **Reminders** - Payment reminders with recurring options
- **AI Financial Insights** - Smart analysis of spending patterns
- **Soft Life Score** - Gamified financial wellness scoring
- **Savings Challenges** - Compete and save with challenges
- **WhatsApp Export** - Share expense reports via WhatsApp
- **Analytics** - Deep spending analysis with charts
- **Authentication** - JWT-based auth with protected routes

## Tech Stack

**Frontend:**
- React.js + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Recharts for data visualization
- Framer Motion for animations
- Axios for API communication
- Lucide React for icons

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator for validation

## Project Structure

```
/mnt/agents/output/
├── app/              # Frontend React application
│   ├── src/
│   │   ├── pages/    # All page components
│   │   ├── components/
│   │   ├── context/  # Auth context
│   │   ├── services/ # API services
│   │   └── types/    # TypeScript types
│   └── dist/         # Production build
│
└── server/           # Backend Express API
    ├── config/       # Database config
    ├── controllers/  # Route controllers
    ├── middleware/   # Auth middleware
    ├── models/       # Mongoose models
    └── routes/       # Express routes
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to the server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your MongoDB URI:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/budgetwise
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start the server:
```bash
npm run server
```

### Frontend Setup

1. Navigate to the app folder:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Request password reset

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Expense statistics

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/overview` - Budget overview

### Savings
- `GET /api/savings` - List goals
- `POST /api/savings` - Create goal
- `POST /api/savings/:id/add` - Add to savings
- `PUT /api/savings/:id` - Update goal
- `DELETE /api/savings/:id` - Delete goal

### Reminders
- `GET /api/reminders` - List reminders
- `POST /api/reminders` - Create reminder
- `PATCH /api/reminders/:id/toggle` - Toggle completion
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Dashboard
- `GET /api/dashboard` - Dashboard data
- `GET /api/dashboard/soft-life-score` - Get score

## Deployment

**Frontend:** Deploy the `app/dist` folder to Vercel or Netlify

**Backend:** Deploy the `server` folder to Render or Railway

**Database:** Use MongoDB Atlas for cloud database

## License

MIT License
