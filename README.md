# Budget Tracker App

A simple and elegant budget tracking application built with Next.js, TypeScript, and PostgreSQL. Track your daily expenses with an intuitive interface designed for quick and easy entry.

## Features

- **User Authentication** - Secure registration and login system with password hashing
- **Expense Tracking** - Quick expense entry with amount, category, payment method, and notes
- **Category Management** - 8 predefined categories with visual icons:
  - Food
  - Transport
  - Bills
  - Shopping
  - Health
  - Entertainment
  - Debt
  - Other
- **Payment Methods** - Track expenses by payment type (Cash, GCash, Card)
- **Date Filtering** - Separate today's expenses from previous entries
- **Persistent Storage** - All data saved to PostgreSQL database
- **Responsive Design** - Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Authentication**: bcryptjs for password hashing
- **Database Adapter**: Prisma PostgreSQL adapter

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (local or remote)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd budget
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@host:port/database_name"
```

Replace the connection string with your actual PostgreSQL credentials.

### 4. Set up the database

Generate the Prisma client and sync the database schema:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
budget/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Login API endpoint
│   │   │   └── register/route.ts    # Registration API endpoint
│   │   └── expenses/route.ts        # Expense CRUD API endpoint
│   ├── login/page.tsx               # Login page
│   ├── register/page.tsx            # Registration page
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page (protected)
├── components/
│   └── ExpenseTracker.tsx           # Main expense tracking component
├── lib/
│   └── prisma.ts                    # Prisma client singleton
├── prisma/
│   └── schema.prisma                # Database schema
├── prisma.config.ts                 # Prisma configuration
├── .env                             # Environment variables
└── package.json
```

## Database Schema

### User Model
- `id` - Auto-incrementing primary key
- `email` - Unique user email
- `password` - Hashed password
- `firstName` - User's first name
- `lastName` - User's last name
- `birthday` - User's birth date
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Expense Model
- `id` - Auto-incrementing primary key
- `amount` - Expense amount (Float)
- `category` - Expense category
- `payment` - Payment method used
- `note` - Optional note/description
- `date` - Expense date
- `createdAt` - Record creation timestamp
- `userId` - Foreign key to User

## API Endpoints

### Authentication

**POST** `/api/auth/register`
- Register a new user
- Body: `{ email, password, firstName, lastName, birthday }`

**POST** `/api/auth/login`
- Login existing user
- Body: `{ email, password }`

### Expenses

**GET** `/api/expenses`
- Fetch all expenses for authenticated user
- Headers: `x-user-id: <userId>`

**POST** `/api/expenses`
- Create a new expense
- Headers: `x-user-id: <userId>`
- Body: `{ amount, category, payment, note, date }`

## Usage

### Register an Account
1. Navigate to the registration page
2. Fill in your details (email, password, first name, last name, birthday)
3. Click "Create Account"

### Login
1. Enter your email and password
2. Click "Sign In"

### Add an Expense
1. Enter the amount in Philippine Pesos (₱)
2. Select a category
3. Choose payment method
4. Optionally add a note and change the date
5. Click "Save Expense"

### View Today's Spending
- Today's total and recent expenses are displayed at the bottom
- Only expenses from today are shown in the summary
- Refreshing the page persists all data

## Build for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

Your Name

## Acknowledgments

- Built with Next.js App Router
- UI inspired by modern mobile expense trackers
- Icons: Emoji-based for simplicity and universal support
