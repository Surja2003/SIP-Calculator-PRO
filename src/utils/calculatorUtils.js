/**
 * Calculator Utilities
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
 * Calculate future value of lumpsum investment
 * 
 * @param {number} principal - Initial investment amount
 * @param {number} ratePerAnnum - Annual interest rate (in percentage, e.g. 12 for 12%)
 * @param {number} years - Investment duration in years
 * @param {boolean} includeInflation - Whether to adjust for inflation
 * @param {number} inflationRate - Annual inflation rate (in percentage)
 * @returns {number} Future value
 */
export const calculateLumpsumFutureValue = (
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

  // Monthly compounding: convert to monthly rate and compound over months
  const monthlyRate = effectiveRate / 12;
  const totalMonths = years * 12;
  const futureValue = principal * Math.pow(1 + monthlyRate, totalMonths);
  
  return Math.round(futureValue);
};

/**
 * Calculate future value of SIP investment
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
export const calculateSIPFutureValue = (
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
    gains: Math.round(futureValue - totalInvestment)
  };
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
    'Current Value': currentValue,
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
        'Current Value': Math.round(currentValue),
      });
    }
  }
  
  return chartData;
};

/**
 * Calculate the required SIP amount to reach a target amount
 * 
 * @param {number} targetAmount - Target amount to reach
 * @param {number} ratePerAnnum - Annual interest rate (in percentage)
 * @param {number} years - Investment duration in years
 * @param {boolean} includeInflation - Whether to adjust for inflation
 * @param {number} inflationRate - Annual inflation rate (in percentage)
 * @returns {number} Required monthly SIP amount
 */
export const calculateRequiredSIP = (
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