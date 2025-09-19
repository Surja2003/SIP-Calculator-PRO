// Test runner script with Node.js ESM
import * as calculatorUtils from './src/utils/calculatorUtils.js';

// Test formatCurrency
console.log("\n=== Testing formatCurrency ===");
console.log("1,000 →", calculatorUtils.formatCurrency(1000));
console.log("1,00,000 →", calculatorUtils.formatCurrency(100000));
console.log("1,00,00,000 →", calculatorUtils.formatCurrency(10000000));
console.log("Without symbol:", calculatorUtils.formatCurrency(10000, false));
console.log("Invalid input:", calculatorUtils.formatCurrency(null), calculatorUtils.formatCurrency(undefined), calculatorUtils.formatCurrency(NaN));

// Test SIP calculations
console.log("\n=== Testing SIP Future Value ===");
try {
  const sipResult = calculatorUtils.calculateSIPFutureValue({
    monthlyInvestment: 10000,
    years: 10,
    returnRate: 12,
    inflation: 6,
    adjustForInflation: true
  });

  console.log("Monthly SIP:", calculatorUtils.formatCurrency(10000));
  console.log("Duration:", "10 years");
  console.log("Return Rate:", "12%");
  console.log("Inflation:", "6% (adjusted)");
  console.log("Future Value:", calculatorUtils.formatCurrency(sipResult?.futureValue || 0));
  console.log("Total Investment:", calculatorUtils.formatCurrency(sipResult?.totalInvestment || 0));
  console.log("Wealth Gained:", calculatorUtils.formatCurrency(sipResult?.wealthGained || 0));
  console.log("Return %:", (sipResult?.returnPercentage || 0).toFixed(2) + "%");
} catch (error) {
  console.error("Error testing SIP calculations:", error.message);
}

// Test Lumpsum calculations
console.log("\n=== Testing Lumpsum Future Value ===");
try {
  const lumpsumResult = calculatorUtils.calculateLumpsumFutureValue({
    investment: 1000000,
    years: 10,
    returnRate: 12,
    inflation: 6,
    adjustForInflation: true
  });

  console.log("Lumpsum Investment:", calculatorUtils.formatCurrency(1000000));
  console.log("Duration:", "10 years");
  console.log("Return Rate:", "12%");
  console.log("Inflation:", "6% (adjusted)");
  console.log("Future Value:", calculatorUtils.formatCurrency(lumpsumResult?.futureValue || 0));
  console.log("Wealth Gained:", calculatorUtils.formatCurrency(lumpsumResult?.wealthGained || 0));
  console.log("Return %:", (lumpsumResult?.returnPercentage || 0).toFixed(2) + "%");
} catch (error) {
  console.error("Error testing Lumpsum calculations:", error.message);
}

// Test Goal calculations
console.log("\n=== Testing Required SIP ===");
try {
  const goalResult = calculatorUtils.calculateRequiredSIP({
    targetAmount: 10000000,
    years: 15,
    returnRate: 12,
    inflation: 6,
    adjustForInflation: true
  });

  console.log("Target Amount:", calculatorUtils.formatCurrency(10000000));
  console.log("Duration:", "15 years");
  console.log("Return Rate:", "12%");
  console.log("Inflation:", "6% (adjusted)");
  console.log("Required Monthly SIP:", calculatorUtils.formatCurrency(goalResult?.requiredMonthlyInvestment || 0));
  console.log("Total Investment:", calculatorUtils.formatCurrency(goalResult?.totalInvestment || 0));
  console.log("Wealth Gained:", calculatorUtils.formatCurrency(goalResult?.wealthGained || 0));
  console.log("Return %:", (goalResult?.returnPercentage || 0).toFixed(2) + "%");
} catch (error) {
  console.error("Error testing Goal calculations:", error.message);
}

// Test SWP calculations
console.log("\n=== Testing SWP Parameters ===");
try {
  const swpResult = calculatorUtils.calculateSWPParameters({
    corpus: 10000000,
    withdrawalRate: 0.5,  // 0.5% monthly
    returnRate: 8,
    years: 20,
    inflation: 6,
    adjustForInflation: true
  });

  console.log("Initial Corpus:", calculatorUtils.formatCurrency(10000000));
  console.log("Monthly Withdrawal Rate:", "0.5%");
  console.log("Return Rate:", "8%");
  console.log("Duration:", "20 years");
  console.log("Inflation:", "6% (adjusted)");
  console.log("Initial Monthly Withdrawal:", calculatorUtils.formatCurrency(swpResult?.initialMonthlyWithdrawal || 0));
  console.log("Final Monthly Withdrawal:", calculatorUtils.formatCurrency(swpResult?.finalMonthlyWithdrawal || 0));
  console.log("Total Withdrawal:", calculatorUtils.formatCurrency(swpResult?.totalWithdrawal || 0));
  console.log("Remaining Corpus:", calculatorUtils.formatCurrency(swpResult?.remainingCorpus || 0));
  console.log("Withdrawal %:", (swpResult?.withdrawalPercentage || 0).toFixed(2) + "%");
  console.log("Remaining Corpus %:", (swpResult?.remainingCorpusPercentage || 0).toFixed(2) + "%");
} catch (error) {
  console.error("Error testing SWP calculations:", error.message);
}

// Test edge cases
console.log("\n=== Testing Edge Cases ===");

try {
  // Zero values
  console.log("\nZero investment:");
  const zeroInvestment = calculatorUtils.calculateSIPFutureValue({
    monthlyInvestment: 0,
    years: 10,
    returnRate: 12
  });
  console.log("Future Value:", calculatorUtils.formatCurrency(zeroInvestment?.futureValue || 0));

  // Zero years
  console.log("\nZero years:");
  const zeroYears = calculatorUtils.calculateSIPFutureValue({
    monthlyInvestment: 10000,
    years: 0,
    returnRate: 12
  });
  console.log("Future Value:", calculatorUtils.formatCurrency(zeroYears?.futureValue || 0));

  // Zero return rate
  console.log("\nZero return rate:");
  const zeroReturn = calculatorUtils.calculateSIPFutureValue({
    monthlyInvestment: 10000,
    years: 10,
    returnRate: 0
  });
  console.log("Future Value:", calculatorUtils.formatCurrency(zeroReturn?.futureValue || 0));
  console.log("Total Investment:", calculatorUtils.formatCurrency(zeroReturn?.totalInvestment || 0));

  // Negative return rate (market crash scenario)
  console.log("\nNegative return rate:");
  const negativeReturn = calculatorUtils.calculateSIPFutureValue({
    monthlyInvestment: 10000,
    years: 10,
    returnRate: -5
  });
  console.log("Future Value:", calculatorUtils.formatCurrency(negativeReturn?.futureValue || 0));
  console.log("Total Investment:", calculatorUtils.formatCurrency(negativeReturn?.totalInvestment || 0));

  // Very high return rate
  console.log("\nVery high return rate:");
  const highReturn = calculatorUtils.calculateSIPFutureValue({
    monthlyInvestment: 10000,
    years: 10,
    returnRate: 50
  });
  console.log("Future Value:", calculatorUtils.formatCurrency(highReturn?.futureValue || 0));
  console.log("Total Investment:", calculatorUtils.formatCurrency(highReturn?.totalInvestment || 0));
} catch (error) {
  console.error("Error testing edge cases:", error.message);
}

console.log("\n=== Test Complete ===");