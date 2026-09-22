import { Budget, Category, SavingsGoal, Subscription, Transaction } from '../types';
import { DEFAULT_CATEGORIES } from './formatters';

export function generateSampleData(): {
  transactions: Transaction[];
  subscriptions: Subscription[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
} {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const subscriptions: Subscription[] = [
    {
      id: 'sub_hotstar',
      name: 'Disney+ Hotstar Super (Annual)',
      amount: 899,
      categoryId: 'cat_subscriptions',
      billingCycle: 'yearly',
      startDate: `${currentYear}-01-15`,
      nextBillingDate: `${currentYear + 1}-01-15`,
      paymentMethod: 'upi',
      active: true,
      autoLogTransaction: true,
      website: 'https://hotstar.com'
    },
    {
      id: 'sub_netflix',
      name: 'Netflix India (Standard FHD)',
      amount: 499,
      categoryId: 'cat_subscriptions',
      billingCycle: 'monthly',
      startDate: `${currentYear}-01-10`,
      nextBillingDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-10`,
      paymentMethod: 'credit_card',
      active: true,
      autoLogTransaction: true,
      website: 'https://netflix.com'
    },
    {
      id: 'sub_spotify',
      name: 'Spotify Premium Individual',
      amount: 119,
      categoryId: 'cat_subscriptions',
      billingCycle: 'monthly',
      startDate: `${currentYear}-01-08`,
      nextBillingDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-08`,
      paymentMethod: 'upi',
      active: true,
      autoLogTransaction: true,
      website: 'https://spotify.com'
    },
    {
      id: 'sub_zomato',
      name: 'Zomato Gold Membership',
      amount: 299,
      categoryId: 'cat_dining',
      billingCycle: 'quarterly',
      startDate: `${currentYear}-01-01`,
      nextBillingDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
      paymentMethod: 'upi',
      active: true,
      autoLogTransaction: true,
      website: 'https://zomato.com'
    },
    {
      id: 'sub_jiofiber',
      name: 'JioFiber 100Mbps Broadband',
      amount: 825,
      categoryId: 'cat_utilities',
      billingCycle: 'monthly',
      startDate: `${currentYear}-01-05`,
      nextBillingDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-05`,
      paymentMethod: 'net_banking',
      active: true,
      autoLogTransaction: true
    },
    {
      id: 'sub_cultfit',
      name: 'Cult.fit Gym & Fitness Pass',
      amount: 1499,
      categoryId: 'cat_health',
      billingCycle: 'monthly',
      startDate: `${currentYear}-02-01`,
      nextBillingDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
      paymentMethod: 'upi',
      active: true,
      autoLogTransaction: true
    },
    {
      id: 'sub_prime',
      name: 'Amazon Prime India (Annual)',
      amount: 1499,
      categoryId: 'cat_subscriptions',
      billingCycle: 'yearly',
      startDate: `${currentYear}-03-12`,
      nextBillingDate: `${currentYear + 1}-03-12`,
      paymentMethod: 'credit_card',
      active: true,
      autoLogTransaction: true
    }
  ];

  const budgets: Budget[] = [
    { id: 'b_total', categoryId: 'total', monthlyLimit: 65000, alertThreshold: 85 },
    { id: 'b_rent', categoryId: 'cat_rent', monthlyLimit: 26000, alertThreshold: 90 },
    { id: 'b_food', categoryId: 'cat_food', monthlyLimit: 12000, alertThreshold: 80 },
    { id: 'b_dining', categoryId: 'cat_dining', monthlyLimit: 6000, alertThreshold: 75 },
    { id: 'b_maid', categoryId: 'cat_maid', monthlyLimit: 6000, alertThreshold: 85 },
    { id: 'b_utilities', categoryId: 'cat_utilities', monthlyLimit: 5000, alertThreshold: 85 },
    { id: 'b_transport', categoryId: 'cat_transport', monthlyLimit: 4500, alertThreshold: 80 },
    { id: 'b_sub', categoryId: 'cat_subscriptions', monthlyLimit: 2500, alertThreshold: 85 },
  ];

  const savingsGoals: SavingsGoal[] = [
    {
      id: 'sg_emergency',
      name: 'Emergency Fund (6 Months Expenses)',
      targetAmount: 350000,
      currentAmount: 220000,
      deadline: `${currentYear}-12-31`,
      color: '#10b981',
      icon: 'ShieldCheck',
      notes: 'High-yield auto-sweep fixed deposit reserve'
    },
    {
      id: 'sg_festive',
      name: 'Diwali & Festive Family Shopping',
      targetAmount: 50000,
      currentAmount: 32000,
      deadline: `${currentYear}-11-01`,
      color: '#eab308',
      icon: 'Gift',
      notes: 'Gifts, traditional attire, and home decor'
    },
    {
      id: 'sg_gold',
      name: 'Sovereign Gold / Digital Gold (SGB)',
      targetAmount: 120000,
      currentAmount: 75000,
      deadline: `${currentYear}-12-15`,
      color: '#f59e0b',
      icon: 'PiggyBank',
      notes: 'Long-term inflation hedge allocation'
    },
    {
      id: 'sg_trip',
      name: 'Goa / Ladakh Workation Trip',
      targetAmount: 45000,
      currentAmount: 30000,
      deadline: `${currentYear}-10-15`,
      color: '#6366f1',
      icon: 'Plane',
      notes: 'Flights, homestay, and bike rental'
    }
  ];

  const transactions: Transaction[] = [];

  // Generate realistic monthly transactions for the past 6 months up to current month
  for (let m = 0; m <= currentMonth; m++) {
    const monthStr = String(m + 1).padStart(2, '0');
    
    // Monthly Salary (Credited on 1st)
    transactions.push({
      id: `tx_salary_${m}`,
      title: 'Monthly Tech Salary Credit',
      amount: 85000,
      type: 'income',
      categoryId: 'cat_salary',
      date: `${currentYear}-${monthStr}-01`,
      paymentMethod: 'bank_transfer',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Direct deposit via NEFT/IMPS',
      createdAt: `${currentYear}-${monthStr}-01T09:00:00Z`
    });

    if (m % 2 === 0) {
      transactions.push({
        id: `tx_freelance_${m}`,
        title: 'Freelance Design & Web Gig',
        amount: 18500,
        type: 'income',
        categoryId: 'cat_freelance',
        date: `${currentYear}-${monthStr}-18`,
        paymentMethod: 'upi',
        isRecurring: false,
        notes: 'Payment received via UPI handle',
        createdAt: `${currentYear}-${monthStr}-18T14:30:00Z`
      });
    }

    // Monthly Rent & Society Maintenance
    transactions.push({
      id: `tx_rent_${m}`,
      title: '2BHK Apartment Rent & Maintenance',
      amount: 24000,
      type: 'expense',
      categoryId: 'cat_rent',
      date: `${currentYear}-${monthStr}-02`,
      paymentMethod: 'net_banking',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Transferred to Landlord HDFC account',
      createdAt: `${currentYear}-${monthStr}-02T10:00:00Z`
    });

    // Monthly Mutual Fund SIP (Wealth Building)
    transactions.push({
      id: `tx_sip_${m}`,
      title: 'Nifty 50 Index Mutual Fund SIP',
      amount: 10000,
      type: 'expense',
      categoryId: 'cat_investments',
      date: `${currentYear}-${monthStr}-05`,
      paymentMethod: 'auto_debit',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Automated NACH auto-debit',
      createdAt: `${currentYear}-${monthStr}-05T06:00:00Z`
    });

    // Maid & Cook Domestic Help Salary
    transactions.push({
      id: `tx_maid_${m}`,
      title: 'Maid & Cook Monthly Salary',
      amount: 5500,
      type: 'expense',
      categoryId: 'cat_maid',
      date: `${currentYear}-${monthStr}-03`,
      paymentMethod: 'upi',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Paid via PhonePe QR',
      createdAt: `${currentYear}-${monthStr}-03T11:00:00Z`
    });

    // Active Subscriptions
    transactions.push({
      id: `tx_netflix_${m}`,
      title: 'Netflix India FHD Plan',
      amount: 499,
      type: 'expense',
      categoryId: 'cat_subscriptions',
      date: `${currentYear}-${monthStr}-10`,
      paymentMethod: 'credit_card',
      isRecurring: true,
      subscriptionId: 'sub_netflix',
      createdAt: `${currentYear}-${monthStr}-10T08:00:00Z`
    });

    transactions.push({
      id: `tx_spotify_${m}`,
      title: 'Spotify Premium Individual',
      amount: 119,
      type: 'expense',
      categoryId: 'cat_subscriptions',
      date: `${currentYear}-${monthStr}-08`,
      paymentMethod: 'upi',
      isRecurring: true,
      subscriptionId: 'sub_spotify',
      createdAt: `${currentYear}-${monthStr}-08T08:00:00Z`
    });

    transactions.push({
      id: `tx_jiofiber_${m}`,
      title: 'JioFiber 100Mbps Broadband',
      amount: 825,
      type: 'expense',
      categoryId: 'cat_utilities',
      date: `${currentYear}-${monthStr}-05`,
      paymentMethod: 'net_banking',
      isRecurring: true,
      subscriptionId: 'sub_jiofiber',
      createdAt: `${currentYear}-${monthStr}-05T08:00:00Z`
    });

    // Electricity / Discom Bill
    transactions.push({
      id: `tx_power_${m}`,
      title: 'Discom Electricity Bill (BESCOM/Tata Power)',
      amount: Number((1800 + (m % 3) * 350).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_utilities',
      date: `${currentYear}-${monthStr}-12`,
      paymentMethod: 'upi',
      createdAt: `${currentYear}-${monthStr}-12T12:00:00Z`
    });

    // Groceries (Blinkit / Zepto / Kirana)
    transactions.push({
      id: `tx_groc1_${m}`,
      title: 'Blinkit / Zepto Instant Grocery & Milk',
      amount: Number((650 + (m * 40) % 180).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_food',
      date: `${currentYear}-${monthStr}-04`,
      paymentMethod: 'upi',
      tags: ['Groceries', 'QuickCommerce'],
      createdAt: `${currentYear}-${monthStr}-04T16:00:00Z`
    });

    transactions.push({
      id: `tx_groc2_${m}`,
      title: 'DMart / Nature Basket Monthly Bulk Pantry',
      amount: Number((2450 + (m * 120) % 400).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_food',
      date: `${currentYear}-${monthStr}-16`,
      paymentMethod: 'credit_card',
      tags: ['DMart', 'Pantry'],
      createdAt: `${currentYear}-${monthStr}-16T17:30:00Z`
    });

    transactions.push({
      id: `tx_groc3_${m}`,
      title: 'Fresh Sabzi & Fruits Mandi',
      amount: Number((380 + (m * 30) % 120).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_food',
      date: `${currentYear}-${monthStr}-24`,
      paymentMethod: 'upi',
      createdAt: `${currentYear}-${monthStr}-24T11:20:00Z`
    });

    // Dining (Swiggy / Zomato / Chai)
    transactions.push({
      id: `tx_dining1_${m}`,
      title: 'Zomato Biryani & Kebabs Dinner',
      amount: Number((540 + (m * 45) % 150).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_dining',
      date: `${currentYear}-${monthStr}-07`,
      paymentMethod: 'upi',
      tags: ['Dinner', 'Zomato'],
      createdAt: `${currentYear}-${monthStr}-07T20:00:00Z`
    });

    transactions.push({
      id: `tx_dining2_${m}`,
      title: 'Cafe Chai, Snacks & Samosas',
      amount: Number((180 + (m * 20) % 60).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_dining',
      date: `${currentYear}-${monthStr}-21`,
      paymentMethod: 'upi',
      createdAt: `${currentYear}-${monthStr}-21T17:45:00Z`
    });

    // Transport & Petrol
    transactions.push({
      id: `tx_fuel_${m}`,
      title: 'HPCL / Shell Petrol Pump Refuel',
      amount: Number((1200 + (m * 50) % 200).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_transport',
      date: `${currentYear}-${monthStr}-10`,
      paymentMethod: 'upi',
      createdAt: `${currentYear}-${monthStr}-10T09:15:00Z`
    });

    transactions.push({
      id: `tx_uber_${m}`,
      title: 'Ola / Uber / Metro Smart Card Recharge',
      amount: Number((450 + (m * 40) % 150).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_transport',
      date: `${currentYear}-${monthStr}-22`,
      paymentMethod: 'upi',
      createdAt: `${currentYear}-${monthStr}-22T22:10:00Z`
    });

    // Healthcare / Pharmacy
    transactions.push({
      id: `tx_meds_${m}`,
      title: 'Apollo Pharmacy Meds & Multivitamins',
      amount: Number((620 + (m * 35) % 140).toFixed(2)),
      type: 'expense',
      categoryId: 'cat_health',
      date: `${currentYear}-${monthStr}-14`,
      paymentMethod: 'upi',
      createdAt: `${currentYear}-${monthStr}-14T15:00:00Z`
    });

    // Shopping
    if (m % 2 === 1) {
      transactions.push({
        id: `tx_shopping_${m}`,
        title: 'Myntra / Amazon India Apparel',
        amount: Number((1650 + (m * 150) % 500).toFixed(2)),
        type: 'expense',
        categoryId: 'cat_shopping',
        date: `${currentYear}-${monthStr}-19`,
        paymentMethod: 'credit_card',
        createdAt: `${currentYear}-${monthStr}-19T15:00:00Z`
      });
    }
  }

  return {
    transactions,
    subscriptions,
    budgets,
    savingsGoals,
    categories: DEFAULT_CATEGORIES
  };
}
