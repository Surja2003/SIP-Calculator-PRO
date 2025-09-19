// Utility functions for SIP and Lumpsum calculations

/**
 * Calculate future value of SIP investments
 * @param {number} monthlyInvestment - Monthly SIP amount
 * @param {number} annualRate - Annual interest rate (in percentage)
 * @param {number} years - Investment duration in years
 * @returns {Object} Object containing future value and total invested amount
 */
export const calculateSIP = (monthlyInvestment, annualRate, years, inflation = 0) => {
    const realReturnRate = (1 + annualRate/100) / (1 + inflation/100) - 1;
    const monthlyRate = realReturnRate / 12;
    const months = years * 12;
    const totalInvested = monthlyInvestment * months;
    
    // Formula: FV = P × ((1 + r)^n - 1) / r × (1 + r)
    // Where: P = Monthly Investment, r = Monthly Rate, n = Number of Months
    const futureValue = monthlyInvestment * 
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
        (1 + monthlyRate);

    const totalReturns = futureValue - totalInvested;
    
    return {
        futureValue: Math.round(futureValue),
        totalInvested: Math.round(totalInvested),
        totalReturns: Math.round(totalReturns)
    };
};

/**
 * Calculate future value of lumpsum investment
 * @param {number} principal - One-time investment amount
 * @param {number} annualRate - Annual interest rate (in percentage)
 * @param {number} years - Investment duration in years
 * @returns {Object} Object containing future value and total returns
 */
export const calculateLumpsum = (principal, annualRate, years, inflation = 0) => {
    // Calculate real return rate adjusted for inflation
    const realReturnRate = (1 + annualRate/100) / (1 + inflation/100) - 1;
    // Formula: FV = P(1 + r)^t
    // Where: P = Principal, r = Annual Rate, t = Time in years
    const futureValue = principal * Math.pow(1 + realReturnRate, years);
    const totalReturns = futureValue - principal;
    
    return {
        futureValue: Math.round(futureValue),
        totalInvested: Math.round(principal),
        totalReturns: Math.round(totalReturns)
    };
};

/**
 * Format number to Indian currency format
 * @param {number} num - Number to format
 * @returns {string} Formatted string with commas
 */
export const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    }).format(num);
};

/**
 * Calculate SWP (Systematic Withdrawal Plan) details
 * @param {number} principal - Initial investment amount
 * @param {number} monthlyWithdrawal - Monthly withdrawal amount
 * @param {number} annualRate - Expected annual return rate (in percentage)
 * @param {number} years - Investment duration in years
 * @returns {Object} Object containing final corpus and total withdrawals
 */
export const calculateSWP = (principal, monthlyWithdrawal, annualRate, years, inflation = 0) => {
    const realReturnRate = (1 + annualRate/100) / (1 + inflation/100) - 1;
    const monthlyRate = realReturnRate / 12;
    const months = years * 12;
    const totalWithdrawals = monthlyWithdrawal * months;

    // Calculate final corpus after regular withdrawals
    let remainingCorpus = principal;
    for (let i = 0; i < months; i++) {
        // Add monthly returns
        remainingCorpus = remainingCorpus * (1 + monthlyRate);
        // Subtract monthly withdrawal
        remainingCorpus -= monthlyWithdrawal;
    }

    return {
        finalCorpus: Math.round(Math.max(0, remainingCorpus)),
        totalWithdrawn: Math.round(totalWithdrawals),
        initialInvestment: Math.round(principal)
    };
};