import { Category, ParsedMagicExpense, PaymentMethod } from '../types';

export function parseNaturalExpense(input: string, categories: Category[]): ParsedMagicExpense {
  const text = input.trim();
  let remainingText = text;

  // 1. Extract Amount
  // Matches: ₹500, 500rs, rs 500, 500 rupees, 1.5 lakh, 25k, $45, €45
  let amount = 0;

  // Check Indian Lakh / Lac e.g. "1.5 lakh", "2 lac", "1lakh"
  const lakhMatch = remainingText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)\b/i);
  if (lakhMatch) {
    amount = (parseFloat(lakhMatch[1]) || 0) * 100000;
    remainingText = remainingText.replace(lakhMatch[0], ' ');
  } else {
    // Check "k" shorthand e.g. "25k", "2.5k"
    const kMatch = remainingText.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      amount = (parseFloat(kMatch[1]) || 0) * 1000;
      remainingText = remainingText.replace(kMatch[0], ' ');
    } else {
      // General number with Rs / INR / ₹ / $ / €
      const amountRegex = /(?:(?:rs\.?|inr|₹|\$|€|£)\s*)?(\d+(?:[.,]\d{1,2})?)(?:\s*(?:rs\.?|rupees|inr|₹|\$|€|£))?/i;
      const amountMatch = remainingText.match(amountRegex);
      if (amountMatch && amountMatch[1]) {
        const rawNum = amountMatch[1].replace(',', '.');
        amount = parseFloat(rawNum) || 0;
        remainingText = remainingText.replace(amountMatch[0], ' ');
      }
    }
  }

  // 2. Extract Date
  let date = new Date().toISOString().split('T')[0];
  const lower = remainingText.toLowerCase();

  if (/\byesterday\b/i.test(lower) || /\bkal\b/i.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    date = d.toISOString().split('T')[0];
    remainingText = remainingText.replace(/\b(?:yesterday|kal)\b/gi, ' ');
  } else if (/\btoday\b/i.test(lower) || /\baaj\b/i.test(lower)) {
    remainingText = remainingText.replace(/\b(?:today|aaj)\b/gi, ' ');
  } else {
    // Check "on 15th" or "on the 3rd"
    const dayOfMonthMatch = remainingText.match(/\bon\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\b/i);
    if (dayOfMonthMatch) {
      const day = parseInt(dayOfMonthMatch[1], 10);
      const now = new Date();
      if (day >= 1 && day <= 31) {
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        date = d.toISOString().split('T')[0];
        remainingText = remainingText.replace(dayOfMonthMatch[0], ' ');
      }
    }
  }

  // 3. Extract Payment Method (Defaults to UPI in India)
  let paymentMethod: PaymentMethod = 'upi';
  if (/\b(?:cash|paper money|rokda|rokr)\b/i.test(remainingText)) {
    paymentMethod = 'cash';
    remainingText = remainingText.replace(/\b(?:with\s+)?(?:in\s+)?(?:cash|rokda|paper money)\b/gi, ' ');
  } else if (/\b(?:gpay|google pay|phonepe|paytm|cred|bhim|upi|qr|scan)\b/i.test(remainingText)) {
    paymentMethod = 'upi';
    remainingText = remainingText.replace(/\b(?:with\s+)?(?:via\s+)?(?:gpay|google pay|phonepe|paytm|cred|bhim|upi|qr|scan)\b/gi, ' ');
  } else if (/\b(?:netbanking|net banking|imps|neft|rtgs|bank transfer|wire)\b/i.test(remainingText)) {
    paymentMethod = 'net_banking';
    remainingText = remainingText.replace(/\b(?:with\s+)?(?:via\s+)?(?:netbanking|net banking|imps|neft|rtgs|bank transfer|wire)\b/gi, ' ');
  } else if (/\b(?:auto debit|nach|mandate|sip debit)\b/i.test(remainingText)) {
    paymentMethod = 'auto_debit';
    remainingText = remainingText.replace(/\b(?:with\s+)?(?:via\s+)?(?:auto debit|nach|mandate|sip debit)\b/gi, ' ');
  } else if (/\b(?:debit|debit card|atm card)\b/i.test(remainingText)) {
    paymentMethod = 'debit_card';
    remainingText = remainingText.replace(/\b(?:with\s+)?(?:via\s+)?debit(?:\s+card)?\b/gi, ' ');
  } else if (/\b(?:credit|credit card|cc|amex|visa|mastercard)\b/i.test(remainingText)) {
    paymentMethod = 'credit_card';
    remainingText = remainingText.replace(/\b(?:with\s+)?(?:via\s+)?(?:credit(?:\s+card)?|cc|amex|visa|mastercard)\b/gi, ' ');
  }

  // 4. Infer Category from Keywords (Indian daily life)
  const categoryKeywords: Record<string, string[]> = {
    cat_rent: ['rent', 'society maintenance', 'maintenance', 'flat rent', 'apartment rent', 'deposit', 'house rent', 'brokerage'],
    cat_food: ['grocery', 'groceries', 'kirana', 'blinkit', 'zepto', 'instamart', 'bigbasket', 'milk', 'dudh', 'vegetables', 'sabzi', 'supermarket', 'd-mart', 'dmart', 'nature basket', 'fruits'],
    cat_dining: ['swiggy', 'zomato', 'dinner', 'lunch', 'breakfast', 'chai', 'tea', 'coffee', 'cafe', 'restaurant', 'biryani', 'pizza', 'burger', 'haldiram', 'mcdonald', 'kfc', 'starbucks', 'dhaba', 'eatclub', 'magicpin', 'bar', 'beer'],
    cat_maid: ['maid', 'cook', 'bai', 'kamwali', 'domestic help', 'sweeper', 'dhobi', 'ironing', 'car wash', 'driver', 'househelp'],
    cat_utilities: ['electricity', 'bijli', 'power bill', 'bescom', 'tneb', 'mseb', 'tata power', 'adani electricity', 'gas cylinder', 'lpg', 'indane', 'hp gas', 'bharat gas', 'piped gas', 'igl', 'water bill', 'broadband', 'wifi', 'jiofiber', 'airtel xstream', 'mobile recharge', 'dth', 'tata play', 'tatasky'],
    cat_transport: ['petrol', 'diesel', 'cng', 'fuel', 'hpcl', 'bpcl', 'iocl', 'shell', 'ola', 'uber', 'rapido', 'auto', 'rickshaw', 'metro', 'local train', 'irctc', 'train ticket', 'fastag', 'toll', 'bus', 'redbus', 'flight'],
    cat_subscriptions: ['hotstar', 'disney+', 'jiocinema', 'netflix', 'spotify', 'prime video', 'youtube', 'sonyliv', 'zee5', 'cultfit', 'gym', 'audible', 'chatgpt', 'apple music'],
    cat_shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'zara', 'h&m', 'nykaa', 'tata cliq', 'croma', 'reliance digital', 'clothes', 'shoes', 'electronics'],
    cat_health: ['apollo', '1mg', 'tata 1mg', 'pharmacy', 'medicine', 'dawakhana', 'doctor', 'hospital', 'clinic', 'dentist', 'cult.fit', 'gym', 'protein', 'health insurance', 'mediclaim'],
    cat_investments: ['sip', 'mutual fund', 'zerodha', 'groww', 'coin', 'kite', 'upstox', 'ppf', 'nps', 'gold', 'sovereign gold bond', 'sgb', 'fd', 'fixed deposit', 'recurring deposit', 'stocks', 'shares'],
    cat_festivals: ['diwali', 'rakhi', 'raksha bandhan', 'eid', 'holi', 'wedding', 'shagun', 'gift', 'pooja', 'ganesh chaturthi', 'durga puja'],
    cat_education: ['school fees', 'college fees', 'tuition', 'coaching', 'allen', 'byjus', 'unacademy', 'books', 'stationery'],
    cat_salary: ['salary', 'payroll', 'stipend', 'bonus', 'salary credit'],
    cat_freelance: ['freelance', 'consulting', 'upwork', 'client payment', 'side gig']
  };

  let detectedCategoryId = 'cat_misc';
  let bestScore = 0;
  const lowerInput = text.toLowerCase();

  for (const [catId, keywords] of Object.entries(categoryKeywords)) {
    for (const kw of keywords) {
      if (lowerInput.includes(kw)) {
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          detectedCategoryId = catId;
        }
      }
    }
  }

  // Ensure category exists
  if (!categories.some(c => c.id === detectedCategoryId)) {
    detectedCategoryId = 'cat_misc';
  }

  // 5. Clean up title
  // Remove filler words like "paid", "bought", "for", "at", "on", "with", "dollars", "bucks"
  let cleanTitle = remainingText
    .replace(/\b(?:paid|spent|bought|purchased|for|at|with|on|in|dollars|bucks|to|from)\b/gi, ' ')
    .replace(/[^\w\s&'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If title became empty or too short, fallback to text or category name
  if (!cleanTitle || cleanTitle.length < 2) {
    const foundCat = categories.find(c => c.id === detectedCategoryId);
    cleanTitle = foundCat ? foundCat.name : 'Expense Entry';
  } else {
    // Capitalize first letter of each word
    cleanTitle = cleanTitle
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return {
    title: cleanTitle,
    amount,
    categoryId: detectedCategoryId,
    date,
    paymentMethod,
    confidence: bestScore > 0 && amount > 0 ? 0.95 : 0.7
  };
}
