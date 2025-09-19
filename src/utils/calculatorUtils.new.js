/**
 * Calculator Utilities - New implementation with object parameters
 * 
 * Shared functions and constants for SIP, Lumpsum, and SWP calculators
 */

// Scenario definitions
export const SCENARIOS = {
  conservative: {
    name: 'Conservative',
    return: 8,
  },
  moderate: {
    name: 'Moderate',
    return: 12,
  },
  aggressive: {
    name: 'Aggressive',
    return: 15,
  },
};

/**
 * Format currency in Indian format (e.g. ₹1,00,000)
 * 
 * @param {number} value - The value to format
 * @param {boolean} showCurrency - Whether to show the currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, showCurrency = true) => {
  if (isNaN(value) || value === null || value === undefined) {
    return showCurrency ? '₹0' : '0';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: showCurrency ? 'currency' : 'decimal',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return showCurrency ? '₹0' : '0';
  }
};

/**
 * Calculate future value of SIP investment
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.monthlyInvestment - Monthly investment amount
 * @param {number} params.years - Investment duration in years
 * @param {number} params.returnRate - Annual return rate (in percentage)
 * @param {number} params.inflation - Annual inflation rate (in percentage)
 * @param {boolean} params.adjustForInflation - Whether to adjust for inflation
 * @param {boolean} params.isStepUp - Whether it's a step-up SIP
 * @param {number} params.stepUpRate - Annual step-up percentage
 * @param {number} params.stepUpFrequency - Step-up frequency in months
 * @returns {Object} Results object with futureValue, totalInvestment, and more
 */
export function calculateSIPFutureValueObject({
  monthlyInvestment = 0,
  years = 0,
  returnRate = 0,
  inflation = 6,
  adjustForInflation = false,
  isStepUp = false,
  stepUpRate = 10,
  stepUpFrequency = 12
}) {
  try {
    // Use the existing implementation but adapt to new parameter structure
    return calculateSIPFutureValue(
      monthlyInvestment,
      returnRate,
      years,
      adjustForInflation,
      inflation,
      isStepUp,
      stepUpRate,
      stepUpFrequency
    );
  } catch (error) {
    console.error("Error in calculateSIPFutureValueObject:", error);
    return {
      futureValue: 0,
      totalInvestment: 0,
      gains: 0
    };
  }
}

/**
 * Calculate future value of lumpsum investment
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.investment - Initial investment amount
 * @param {number} params.years - Investment duration in years
 * @param {number} params.returnRate - Annual return rate (in percentage)
 * @param {number} params.inflation - Annual inflation rate (in percentage)
 * @param {boolean} params.adjustForInflation - Whether to adjust for inflation
 * @returns {Object} Results object
 */
export function calculateLumpsumFutureValueObject({
  investment = 0,
  years = 0,
  returnRate = 0,
  inflation = 6,
  adjustForInflation = false
}) {
  try {
    // Calculate using the existing function
    const futureValue = calculateLumpsumFutureValue(
      investment,
      returnRate,
      years,
      adjustForInflation,
      inflation
    );
    
    return {
      futureValue: futureValue,
      investment: Math.round(investment),
      wealthGained: Math.round(futureValue - investment),
      returnPercentage: investment > 0 ? ((futureValue - investment) / investment) * 100 : 0,
      inflationAdjustedAmount: adjustForInflation ? 
        Math.round(futureValue * Math.pow(1 + inflation / 100, years)) : 
        futureValue,
      chartData: generateChartData('lumpsum', investment, returnRate, years, adjustForInflation, inflation)
    };
  } catch (error) {
    console.error("Error in calculateLumpsumFutureValueObject:", error);
    return {
      futureValue: 0,
      investment: 0,
      wealthGained: 0,
      returnPercentage: 0,
      inflationAdjustedAmount: 0,
      chartData: []
    };
  }
}

/**
 * Calculate the required SIP amount to reach a target goal
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.targetAmount - Target amount to reach
 * @param {number} params.years - Investment duration in years
 * @param {number} params.returnRate - Annual return rate (in percentage)
 * @param {number} params.inflation - Annual inflation rate (in percentage)
 * @param {boolean} params.adjustForInflation - Whether to adjust for inflation
 * @returns {Object} Results object with requiredMonthlyInvestment and more
 */
export function calculateRequiredSIPObject({
  targetAmount = 0,
  years = 0,
  returnRate = 0,
  inflation = 6,
  adjustForInflation = false
}) {
  try {
    // Calculate inflation-adjusted target amount
    const inflationAdjustedTarget = adjustForInflation
      ? targetAmount * Math.pow(1 + inflation / 100, years)
      : targetAmount;
    
    // Calculate the required monthly SIP using existing function
    const requiredMonthlyInvestment = calculateRequiredSIP(
      adjustForInflation ? inflationAdjustedTarget : targetAmount,
      returnRate,
      years,
      false, // No need to adjust again since we've already adjusted the target
      inflation
    );
    
    // Calculate total investment
    const totalInvestment = requiredMonthlyInvestment * years * 12;
    
    // Calculate wealth gained
    const wealthGained = inflationAdjustedTarget - totalInvestment;
    
    // Calculate return percentage
    const returnPercentage = totalInvestment > 0 
      ? (wealthGained / totalInvestment) * 100 
      : 0;
    
    // Generate chart data
    const chartData = generateChartData(
      'sip',
      requiredMonthlyInvestment,
      returnRate,
      years,
      adjustForInflation,
      inflation
    );
    
    return {
      requiredMonthlyInvestment,
      totalInvestment,
      wealthGained,
      returnPercentage,
      inflationAdjustedTarget,
      originalTarget: targetAmount,
      chartData
    };
  } catch (error) {
    console.error("Error in calculateRequiredSIPObject:", error);
    return {
      requiredMonthlyInvestment: 0,
      totalInvestment: 0,
      wealthGained: 0,
      returnPercentage: 0,
      inflationAdjustedTarget: 0,
      originalTarget: targetAmount,
      chartData: []
    };
  }
}

/**
 * Calculate parameters for Systematic Withdrawal Plan (SWP)
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.corpus - Initial corpus amount
 * @param {number} params.withdrawalRate - Monthly withdrawal rate (percentage of corpus)
 * @param {number} params.returnRate - Annual return rate (in percentage)
 * @param {number} params.years - Withdrawal duration in years
 * @param {number} params.inflation - Annual inflation rate (in percentage)
 * @param {boolean} params.adjustForInflation - Whether to adjust withdrawals for inflation
 * @returns {Object} Results object with withdrawal parameters
 */
export function calculateSWPParametersObject({
  corpus = 0,
  withdrawalRate = 0,
  returnRate = 0,
  years = 0,
  inflation = 6,
  adjustForInflation = false
}) {
  try {
    // Calculate initial monthly withdrawal
    const initialMonthlyWithdrawal = calculateSWPMonthlyWithdrawal(
      corpus,
      returnRate,
      years,
      adjustForInflation,
      inflation
    );
    
    // Calculate annual effective return rate
    const annualEffectiveRate = returnRate / 100;
    
    // Calculate monthly effective return rate
    const monthlyEffectiveRate = Math.pow(1 + annualEffectiveRate, 1/12) - 1;
    
    // Calculate monthly inflation rate
    const monthlyInflationRate = Math.pow(1 + inflation / 100, 1/12) - 1;
    
    // Calculate total months
    const totalMonths = years * 12;
    
    // Generate withdrawal data and calculate totals
    let remainingCorpus = corpus;
    let totalWithdrawal = 0;
    let currentMonthlyWithdrawal = initialMonthlyWithdrawal;
    const chartData = [];
    
    // Initial chart point
    chartData.push({
      month: 0,
      year: 0,
      withdrawal: 0,
      cumulativeWithdrawal: 0,
      remainingCorpus: corpus
    });
    
    for (let month = 1; month <= totalMonths; month++) {
      // Calculate this month's withdrawal amount (adjusted for inflation if needed)
      if (adjustForInflation && month > 1) {
        currentMonthlyWithdrawal *= (1 + monthlyInflationRate);
      }
      
      // Add interest for the month
      remainingCorpus *= (1 + monthlyEffectiveRate);
      
      // Subtract withdrawal
      remainingCorpus -= currentMonthlyWithdrawal;
      
      // Update total withdrawal
      totalWithdrawal += currentMonthlyWithdrawal;
      
      // Handle edge case where corpus is depleted
      if (remainingCorpus < 0) {
        remainingCorpus = 0;
        
        // Adjust final withdrawal if corpus is depleted
        if (month === totalMonths) {
          totalWithdrawal -= currentMonthlyWithdrawal;
          totalWithdrawal += remainingCorpus + currentMonthlyWithdrawal;
        }
      }
      
      // Add data point for chart (every 12 months or the final month)
      if (month % 12 === 0 || month === totalMonths) {
        const year = Math.floor(month / 12);
        chartData.push({
          month,
          year,
          withdrawal: Math.round(currentMonthlyWithdrawal),
          cumulativeWithdrawal: Math.round(totalWithdrawal),
          remainingCorpus: Math.round(remainingCorpus)
        });
      }
    }
    
    // Calculate final withdrawal percentage
    const withdrawalPercentage = corpus > 0 
      ? (totalWithdrawal / corpus) * 100 
      : 0;
    
    // Calculate final corpus percentage
    const remainingCorpusPercentage = corpus > 0 
      ? (remainingCorpus / corpus) * 100 
      : 0;
    
    return {
      initialMonthlyWithdrawal: Math.round(initialMonthlyWithdrawal),
      finalMonthlyWithdrawal: Math.round(currentMonthlyWithdrawal),
      totalWithdrawal: Math.round(totalWithdrawal),
      remainingCorpus: Math.round(remainingCorpus),
      withdrawalPercentage,
      remainingCorpusPercentage,
      chartData
    };
  } catch (error) {
    console.error("Error in calculateSWPParametersObject:", error);
    return {
      initialMonthlyWithdrawal: 0,
      finalMonthlyWithdrawal: 0,
      totalWithdrawal: 0,
      remainingCorpus: 0,
      withdrawalPercentage: 0,
      remainingCorpusPercentage: 0,
      chartData: []
    };
  }
}

// Export compatibility layer for the new parameter style
export const calculateSIPFutureValue = calculateSIPFutureValueObject;
export const calculateLumpsumFutureValue = calculateLumpsumFutureValueObject;
export const calculateRequiredSIP = calculateRequiredSIPObject;
export const calculateSWPParameters = calculateSWPParametersObject;

// Preserve the original functions
export {
  calculateSIPFutureValue as calculateSIPFutureValueLegacy,
  calculateLumpsumFutureValue as calculateLumpsumFutureValueLegacy,
  calculateRequiredSIP as calculateRequiredSIPLegacy,
  calculateSWPMonthlyWithdrawal,
  generateChartData
};