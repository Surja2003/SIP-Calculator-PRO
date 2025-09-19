// Test script for calculator utilities
import {
  formatCurrency,
  calculateSIPFutureValue,
  calculateLumpsumFutureValue,
  calculateRequiredSIP,
  calculateSWPParameters
} from './utils/calculatorUtils';

// Test formatCurrency
console.log("\n=== Testing formatCurrency ===");
console.log("1,000 →", formatCurrency(1000));
console.log("1,00,000 →", formatCurrency(100000));
console.log("1,00,00,000 →", formatCurrency(10000000));
console.log("Without symbol:", formatCurrency(10000, false));
console.log("Invalid input:", formatCurrency(null), formatCurrency(undefined), formatCurrency(NaN));

// Test SIP calculations
console.log("\n=== Testing SIP Future Value ===");
const sipResult = calculateSIPFutureValue({
  monthlyInvestment: 10000,
  years: 10,
  returnRate: 12,
  inflation: 6,
  adjustForInflation: true
});

console.log("Monthly SIP:", formatCurrency(10000));
console.log("Duration:", "10 years");
console.log("Return Rate:", "12%");
console.log("Inflation:", "6% (adjusted)");
console.log("Future Value:", formatCurrency(sipResult.futureValue));
console.log("Total Investment:", formatCurrency(sipResult.totalInvestment));
console.log("Wealth Gained:", formatCurrency(sipResult.wealthGained));
console.log("Return %:", sipResult.returnPercentage.toFixed(2) + "%");

// Test Lumpsum calculations
console.log("\n=== Testing Lumpsum Future Value ===");
const lumpsumResult = calculateLumpsumFutureValue({
  investment: 1000000,
  years: 10,
  returnRate: 12,
  inflation: 6,
  adjustForInflation: true
});

console.log("Lumpsum Investment:", formatCurrency(1000000));
console.log("Duration:", "10 years");
console.log("Return Rate:", "12%");
console.log("Inflation:", "6% (adjusted)");
console.log("Future Value:", formatCurrency(lumpsumResult.futureValue));
console.log("Wealth Gained:", formatCurrency(lumpsumResult.wealthGained));
console.log("Return %:", lumpsumResult.returnPercentage.toFixed(2) + "%");

// Test Goal calculations
console.log("\n=== Testing Required SIP ===");
const goalResult = calculateRequiredSIP({
  targetAmount: 10000000,
  years: 15,
  returnRate: 12,
  inflation: 6,
  adjustForInflation: true
});

console.log("Target Amount:", formatCurrency(10000000));
console.log("Duration:", "15 years");
console.log("Return Rate:", "12%");
console.log("Inflation:", "6% (adjusted)");
console.log("Required Monthly SIP:", formatCurrency(goalResult.requiredMonthlyInvestment));
console.log("Total Investment:", formatCurrency(goalResult.totalInvestment));
console.log("Wealth Gained:", formatCurrency(goalResult.wealthGained));
console.log("Return %:", goalResult.returnPercentage.toFixed(2) + "%");

// Test SWP calculations
console.log("\n=== Testing SWP Parameters ===");
const swpResult = calculateSWPParameters({
  corpus: 10000000,
  withdrawalRate: 0.5,  // 0.5% monthly
  returnRate: 8,
  years: 20,
  inflation: 6,
  adjustForInflation: true
});

console.log("Initial Corpus:", formatCurrency(10000000));
console.log("Monthly Withdrawal Rate:", "0.5%");
console.log("Return Rate:", "8%");
console.log("Duration:", "20 years");
console.log("Inflation:", "6% (adjusted)");
console.log("Initial Monthly Withdrawal:", formatCurrency(swpResult.initialMonthlyWithdrawal));
console.log("Final Monthly Withdrawal:", formatCurrency(swpResult.finalMonthlyWithdrawal));
console.log("Total Withdrawal:", formatCurrency(swpResult.totalWithdrawal));
console.log("Remaining Corpus:", formatCurrency(swpResult.remainingCorpus));
console.log("Withdrawal %:", swpResult.withdrawalPercentage.toFixed(2) + "%");
console.log("Remaining Corpus %:", swpResult.remainingCorpusPercentage.toFixed(2) + "%");

// Test edge cases
console.log("\n=== Testing Edge Cases ===");

// Zero values
console.log("\nZero investment:");
const zeroInvestment = calculateSIPFutureValue({
  monthlyInvestment: 0,
  years: 10,
  returnRate: 12
});
console.log("Future Value:", formatCurrency(zeroInvestment.futureValue));

// Zero years
console.log("\nZero years:");
const zeroYears = calculateSIPFutureValue({
  monthlyInvestment: 10000,
  years: 0,
  returnRate: 12
});
console.log("Future Value:", formatCurrency(zeroYears.futureValue));

// Zero return rate
console.log("\nZero return rate:");
const zeroReturn = calculateSIPFutureValue({
  monthlyInvestment: 10000,
  years: 10,
  returnRate: 0
});
console.log("Future Value:", formatCurrency(zeroReturn.futureValue));
console.log("Total Investment:", formatCurrency(zeroReturn.totalInvestment));

// Negative return rate (market crash scenario)
console.log("\nNegative return rate:");
const negativeReturn = calculateSIPFutureValue({
  monthlyInvestment: 10000,
  years: 10,
  returnRate: -5
});
console.log("Future Value:", formatCurrency(negativeReturn.futureValue));
console.log("Total Investment:", formatCurrency(negativeReturn.totalInvestment));

// Very high return rate
console.log("\nVery high return rate:");
const highReturn = calculateSIPFutureValue({
  monthlyInvestment: 10000,
  years: 10,
  returnRate: 50
});
console.log("Future Value:", formatCurrency(highReturn.futureValue));
console.log("Total Investment:", formatCurrency(highReturn.totalInvestment));

console.log("\n=== Test Complete ===");