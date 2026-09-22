# SpendWise - Monthly & Yearly Expense and Subscription Tracker

A comprehensive personal finance and expense tracking web application built with **React**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and **Chart.js**.

---

## ✨ Features

- 📅 **Flexible Timeframe Controls**: Switch seamlessly between **Monthly**, **Yearly**, **All Time**, and **Custom Date Range** views.
- 💳 **Complete Expense & Inflow Tracking**:
  - Add, edit, duplicate, and delete transactions.
  - Multi-category organization with custom badges (*Rent & Housing, Food & Groceries, Dining, Subscriptions, Utilities, Transportation, Shopping, Healthcare, Entertainment, Education, Travel, Investments, etc.*).
  - Payment method tagging (*Credit Card, Debit Card, NetBanking, UPI, Cash*).
  - Search, multi-criteria filtering, and sort by date or amount.
- 🔁 **Dedicated Subscriptions Hub**:
  - Track recurring bills like Rent, Netflix, Spotify, Gym, iCloud, and Internet.
  - Automatic renewal countdowns and upcoming payment alerts.
  - Annualized commitment calculations to see the true yearly cost of active subscriptions.
- 🎯 **Monthly Budgets & Alerts**:
  - Set spending caps for total monthly expenditure or individual categories (e.g., Dining, Groceries, Shopping).
  - Live progress bars with visual threshold alerts (Green -> Warning at 80% -> Red when exceeded).
- 🐷 **Savings Goals Planner**:
  - Set targets for Emergency Funds, vacations, tech upgrades, or down payments.
  - Log deposit contributions with interactive celebration confetti on goal completion.
- 📊 **Interactive Analytics & Reports**:
  - Category doughnut breakdown chart with percentage shares.
  - 12-Month Inflow vs Outflow comparison bar chart.
  - Payment method distribution chart.
  - Fixed vs Flexible spending analysis (Needs vs Discretionary).
  - Top 5 largest single outflows.
- 💾 **Privacy & Data Portability**:
  - 100% Client-side privacy with `localStorage` persistence.
  - **Export to CSV** (Excel / Google Sheets compatible) & **Full JSON Backup**.
  - **Import CSV / JSON** to easily restore records or load statements.
  - **1-Click Demo Data Loader** for instant testing.
- 🌍 **Multi-Currency & Themes**:
  - Built-in currency switcher (USD `$`, EUR `€`, GBP `£`, INR `₹`, CAD, AUD, JPY `¥`, SGD, AED).
  - Dark Mode and Light Mode with system preference detection.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphism effects
- **Charts**: Chart.js & React-Chartjs-2
- **Icons**: Lucide React
- **Animations / Effects**: Canvas-Confetti
