/**
 * Calculator Utilities - Fixed implementation with object parameters
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
 * Calculate future value of SIP investment using the legacy parameter style
 * 
 * @param {number} monthlyInvestment - Monthly investment amount
 * @param {number} ratePerAnnum - Annual interest rate (in percentage, e.g. 12 for 12%)
 * @param {number} years - Investment duration in years
 * @param {boolean} includeInflation - Whether to adjust for inflation
 * @param {number} inflationRate - Annual inflation rate (in percentage)
 * @param {boolean} isStepUpSIP - Whether it's a step-up SIP
 * @param {number} stepUpPercentage - Annual step-up percentage
 * @param {number} stepUpFrequency - Step-up frequency in months (usually 12 for annual step-up)
 * @returns {Object} Results object with futureValue, totalInvestment, and gains
 */
export const calculateSIPFutureValueLegacy = (
  monthlyInvestment,
  ratePerAnnum,
  years,
  includeInflation = false,
  inflationRate = 6,
  isStepUpSIP = false,
  stepUpPercentage = 10,
  stepUpFrequency = 12
) => {
  // Ensure all parameters are valid numbers
  monthlyInvestment = Number(monthlyInvestment) || 0;
  ratePerAnnum = Number(ratePerAnnum) || 0;
  years = Number(years) || 0;
  inflationRate = Number(inflationRate) || 0;
  stepUpPercentage = Number(stepUpPercentage) || 0;
  stepUpFrequency = Number(stepUpFrequency) || 12;

  // Calculate effective rate after inflation adjustment
  let effectiveRate = ratePerAnnum;
  if (includeInflation) {
    effectiveRate = ((1 + ratePerAnnum / 100) / (1 + inflationRate / 100) - 1) * 100;
  }

  const monthlyRate = effectiveRate / (12 * 100);
  const totalMonths = years * 12;
  
  let futureValue = 0;
  let totalInvestment = 0;
  let currentMonthlyAmount = monthlyInvestment;

  // Calculate month by month
  for (let month = 1; month <= totalMonths; month++) {
    // Apply step-up at specified frequency
    if (isStepUpSIP && month > 1 && month % stepUpFrequency === 1) {
      currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpPercentage / 100);
    }
    
    // Add this month's investment
    totalInvestment += currentMonthlyAmount;
    
    // Apply interest to the current balance plus this month's investment
    futureValue = (futureValue + currentMonthlyAmount) * (1 + monthlyRate);
  }

  return {
    futureValue: Math.round(futureValue),
    totalInvestment: Math.round(totalInvestment),
    gains: Math.round(futureValue - totalInvestment),
    wealthGained: Math.round(futureValue - totalInvestment),
    returnPercentage: totalInvestment > 0 ? ((futureValue - totalInvestment) / totalInvestment) * 100 : 0
  };
};

/**
 * Calculate future value of lumpsum investment using the legacy parameter style
 * 
 * @param {number} principal - Initial investment amount
 * @param {number} ratePerAnnum - Annual interest rate (in percentage, e.g. 12 for 12%)
 * @param {number} years - Investment duration in years
 * @param {boolean} includeInflation - Whether to adjust for inflation
 * @param {number} inflationRate - Annual inflation rate (in percentage)
 * @returns {number} Future value
 */
export const calculateLumpsumFutureValueLegacy = (
  principal, 
  ratePerAnnum, 
  years, 
  includeInflation = false,
  inflationRate = 6
) => {
  // Ensure all parameters are valid numbers
  principal = Number(principal) || 0;
  ratePerAnnum = Number(ratePerAnnum) || 0;
  years = Number(years) || 0;
  inflationRate = Number(inflationRate) || 0;

  // Calculate effective rate after inflation adjustment
  let effectiveRate = ratePerAnnum / 100;
  if (includeInflation) {
    effectiveRate = ((1 + ratePerAnnum / 100) / (1 + inflationRate / 100)) - 1;
  }

  // Calculate future value using compound interest formula
  const futureValue = principal * Math.pow(1 + effectiveRate, years);
  
  return Math.round(futureValue);
};

/**
 * Generate chart data for investment growth
 * 
 * @param {string} calculatorType - Type of calculator ('sip', 'lumpsum', or 'swp')
 * @param {number} amount - Monthly investment (SIP), initial investment (Lumpsum), or corpus (SWP)
 * @param {number} ratePerAnnum - Annual interest rate (in percentage)
 * @param {number} years - Duration in years
 * @param {boolean} includeInflation - Whether to adjust for inflation
 * @param {number} inflationRate - Annual inflation rate (in percentage)
 * @param {boolean} isStepUpSIP - Whether it's a step-up SIP (only for 'sip' type)
 * @param {number} stepUpPercentage - Annual step-up percentage (only for 'sip' type)
 * @param {number} stepUpFrequency - Step-up frequency in months (only for 'sip' type)
 * @returns {Array} Chart data array
 */
export const generateChartData = (
  calculatorType,
  amount,
  ratePerAnnum,
  years,
  includeInflation = false,
  inflationRate = 6,
  isStepUpSIP = false,
  stepUpPercentage = 10,
  stepUpFrequency = 12
) => {
  // Ensure all parameters are valid numbers
  amount = Number(amount) || 0;
  ratePerAnnum = Number(ratePerAnnum) || 0;
  years = Number(years) || 0;
  inflationRate = Number(inflationRate) || 0;
  
  // Calculate effective rate after inflation adjustment
  let effectiveRate = ratePerAnnum;
  if (includeInflation) {
    effectiveRate = ((1 + ratePerAnnum / 100) / (1 + inflationRate / 100) - 1) * 100;
  }
  
  const monthlyRate = effectiveRate / (12 * 100);
  const totalMonths = years * 12;
  
  const chartData = [];
  let currentValue = calculatorType === 'lumpsum' ? amount : 0;
  let totalInvestment = calculatorType === 'lumpsum' ? amount : 0;
  let currentMonthlyAmount = calculatorType === 'swp' ? 
    calculateSWPMonthlyWithdrawal(amount, ratePerAnnum, years, includeInflation, inflationRate) : 
    amount;
  
  // Add initial data point
  chartData.push({
    year: `Year 0`,
    month: 0,
    Invested: totalInvestment,
    Investment: totalInvestment,
    'Current Value': currentValue,
    'Expected Value': currentValue
  });
  
  // Calculate month by month
  for (let month = 1; month <= totalMonths; month++) {
    // Apply step-up at specified frequency for SIP
    if (calculatorType === 'sip' && isStepUpSIP && month > 1 && month % stepUpFrequency === 1) {
      currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpPercentage / 100);
    }
    
    // Update values based on calculator type
    if (calculatorType === 'sip') {
      // For SIP, add monthly investment and apply interest
      totalInvestment += currentMonthlyAmount;
      currentValue = (currentValue + currentMonthlyAmount) * (1 + monthlyRate);
    } else if (calculatorType === 'lumpsum') {
      // For Lumpsum, just apply interest
      currentValue = currentValue * (1 + monthlyRate);
    } else if (calculatorType === 'swp') {
      // For SWP, subtract monthly withdrawal and apply interest
      currentValue = (currentValue - currentMonthlyAmount) * (1 + monthlyRate);
      totalInvestment -= currentMonthlyAmount;
    }
    
    // Add data point at yearly intervals
    if (month % 12 === 0) {
      chartData.push({
        year: `Year ${month / 12}`,
        month: month,
        Invested: Math.round(totalInvestment),
        Investment: Math.round(totalInvestment),
        'Current Value': Math.round(currentValue),
        'Expected Value': Math.round(currentValue),
      });
    }
  }
  
  return chartData;
};

/**
 * Calculate monthly withdrawal amount for SWP
 * 
 * @param {number} corpusAmount - Initial corpus amount
 * @param {number} ratePerAnnum - Annual interest rate (in percentage, e.g. 12 for 12%)
 * @param {number} years - Withdrawal duration in years
 * @param {boolean} includeInflation - Whether to adjust for inflation
 * @param {number} inflationRate - Annual inflation rate (in percentage)
 * @returns {number} Monthly withdrawal amount
 */
export const calculateSWPMonthlyWithdrawal = (
  corpusAmount,
  ratePerAnnum,
  years,
  includeInflation = false,
  inflationRate = 6
) => {
  // Ensure all parameters are valid numbers
  corpusAmount = Number(corpusAmount) || 0;
  ratePerAnnum = Number(ratePerAnnum) || 0;
  years = Number(years) || 0;
  inflationRate = Number(inflationRate) || 0;

  // Calculate effective rate after inflation adjustment
  let effectiveRate = ratePerAnnum;
  if (includeInflation) {
    effectiveRate = ((1 + ratePerAnnum / 100) / (1 + inflationRate / 100) - 1) * 100;
  }

  const monthlyRate = effectiveRate / (12 * 100);
  const totalMonths = years * 12;
  
  // Calculate monthly withdrawal amount using PMT formula
  // PMT = (PV * r) / (1 - (1 + r)^-n)
  // where PV = present value, r = rate per period, n = number of periods
  
  if (monthlyRate === 0) {
    // Simple division if no interest
    return Math.round(corpusAmount / totalMonths);
  }
  
  const monthlyWithdrawal = 
    (corpusAmount * monthlyRate) / 
    (1 - Math.pow(1 + monthlyRate, -totalMonths));
  
  return Math.round(monthlyWithdrawal);
};

/**
 * Calculate the required SIP amount to reach a target amount using legacy parameters
 * 
 * @param {number} targetAmount - Target amount to reach
 * @param {number} ratePerAnnum - Annual interest rate (in percentage)
 * @param {number} years - Investment duration in years
 * @param {boolean} includeInflation - Whether to adjust for inflation
 * @param {number} inflationRate - Annual inflation rate (in percentage)
 * @returns {number} Required monthly SIP amount
 */
export const calculateRequiredSIPLegacy = (
  targetAmount,
  ratePerAnnum,
  years,
  includeInflation = false,
  inflationRate = 6
) => {
  // Ensure all parameters are valid numbers
  targetAmount = Number(targetAmount) || 0;
  ratePerAnnum = Number(ratePerAnnum) || 0;
  years = Number(years) || 0;
  inflationRate = Number(inflationRate) || 0;

  // Calculate effective rate after inflation adjustment
  let effectiveRate = ratePerAnnum;
  if (includeInflation) {
    effectiveRate = ((1 + ratePerAnnum / 100) / (1 + inflationRate / 100) - 1) * 100;
  }

  const monthlyRate = effectiveRate / (12 * 100);
  const totalMonths = years * 12;
  
  // Calculate using SIP formula: A = P * (((1 + r)^n - 1) / r) * (1 + r)
  // where A = target amount, P = monthly investment, r = monthly rate, n = number of months
  // Solving for P: P = A / ((((1 + r)^n - 1) / r) * (1 + r))
  
  if (monthlyRate === 0) {
    // Simple division if no interest
    return Math.round(targetAmount / totalMonths);
  }
  
  const denominator = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  const monthlyInvestment = targetAmount / denominator;
  
  return Math.round(monthlyInvestment);
};

/**
 * Calculate future value of SIP investment with object parameters
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
export function calculateSIPFutureValue({
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
    // Use the legacy function but with our parameters
    const result = calculateSIPFutureValueLegacy(
      monthlyInvestment,
      returnRate,
      years,
      adjustForInflation,
      inflation,
      isStepUp,
      stepUpRate,
      stepUpFrequency
    );
    
    // Generate chart data
    const chartData = generateChartData(
      'sip',
      monthlyInvestment,
      returnRate,
      years,
      adjustForInflation,
      inflation,
      isStepUp,
      stepUpRate,
      stepUpFrequency
    );
    
    return {
      ...result,
      chartData
    };
  } catch (error) {
    console.error("Error in calculateSIPFutureValue:", error);
    return {
      futureValue: 0,
      totalInvestment: 0,
      gains: 0,
      wealthGained: 0,
      returnPercentage: 0,
      chartData: []
    };
  }
}

/**
 * Calculate future value of lumpsum investment with object parameters
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.investment - Initial investment amount
 * @param {number} params.years - Investment duration in years
 * @param {number} params.returnRate - Annual return rate (in percentage)
 * @param {number} params.inflation - Annual inflation rate (in percentage)
 * @param {boolean} params.adjustForInflation - Whether to adjust for inflation
 * @returns {Object} Results object
 */
export function calculateLumpsumFutureValue({
  investment = 0,
  years = 0,
  returnRate = 0,
  inflation = 6,
  adjustForInflation = false
}) {
  try {
    // Calculate using the legacy function
    const futureValue = calculateLumpsumFutureValueLegacy(
      investment,
      returnRate,
      years,
      adjustForInflation,
      inflation
    );
    
    // Generate chart data
    const chartData = generateChartData(
      'lumpsum',
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
      chartData
    };
  } catch (error) {
    console.error("Error in calculateLumpsumFutureValue:", error);
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
 * Calculate the required SIP amount to reach a target goal with object parameters
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.targetAmount - Target amount to reach
 * @param {number} params.years - Investment duration in years
 * @param {number} params.returnRate - Annual return rate (in percentage)
 * @param {number} params.inflation - Annual inflation rate (in percentage)
 * @param {boolean} params.adjustForInflation - Whether to adjust for inflation
 * @returns {Object} Results object with requiredMonthlyInvestment and more
 */
export function calculateRequiredSIP({
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
    
    // Calculate the required monthly SIP using legacy function
    const requiredMonthlyInvestment = calculateRequiredSIPLegacy(
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
    console.error("Error in calculateRequiredSIP:", error);
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
 * Calculate parameters for Systematic Withdrawal Plan (SWP) with object parameters
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
export function calculateSWPParameters({
  corpus = 0,
  withdrawalRate = 0,
  returnRate = 0,
  years = 0,
  inflation = 6,
  adjustForInflation = false
}) {
  try {
    // Calculate initial monthly withdrawal
    const initialMonthlyWithdrawal = (corpus * withdrawalRate) / 100;
    
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
    console.error("Error in calculateSWPParameters:", error);
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