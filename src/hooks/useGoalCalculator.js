import { useState, useMemo } from 'react';

export const useGoalCalculator = () => {
  const [goalData, setGoalData] = useState({
    targetAmount: 1000000,
    timeframe: 10,
    expectedReturn: 12,
    inflation: 6,
    includeInflation: true,
  });

  const requiredMonthlyInvestment = useMemo(() => {
    const targetAmount = Number(goalData.targetAmount);
    const years = Number(goalData.timeframe);
    const returnRate = Number(goalData.expectedReturn) / 100;
    const inflationRate = goalData.includeInflation ? Number(goalData.inflation) / 100 : 0;
    const realReturnRate = (1 + returnRate) / (1 + inflationRate) - 1;
    const monthlyRate = realReturnRate / 12;
    const months = years * 12;

    // PMT formula: PMT = FV * r / ((1 + r)^n - 1)
    // Where: FV = Future Value, r = Monthly Rate, n = Number of Months
    const monthlyInvestment = (targetAmount * monthlyRate) / 
      (Math.pow(1 + monthlyRate, months) - 1);

    return Math.round(monthlyInvestment);
  }, [goalData]);

  const projectedData = useMemo(() => {
    const data = [];
    const monthlyInvestment = requiredMonthlyInvestment;
    const years = Number(goalData.timeframe);
    const returnRate = Number(goalData.expectedReturn) / 100;
    const inflationRate = goalData.includeInflation ? Number(goalData.inflation) / 100 : 0;
    const realReturnRate = (1 + returnRate) / (1 + inflationRate) - 1;
    const monthlyRate = realReturnRate / 12;

    let totalInvestment = 0;
    let currentValue = 0;

    for (let year = 0; year <= years; year++) {
      totalInvestment = monthlyInvestment * year * 12;
      
      if (year === 0) {
        data.push({
          year: `Year ${year}`,
          invested: totalInvestment,
          projected: currentValue,
        });
        continue;
      }

      currentValue = Array.from({ length: year * 12 }).reduce((acc) => {
        return (acc + monthlyInvestment) * (1 + monthlyRate);
      }, 0);

      data.push({
        year: `Year ${year}`,
        invested: totalInvestment,
        projected: Math.round(currentValue),
      });
    }

    return data;
  }, [goalData, requiredMonthlyInvestment]);

  return {
    goalData,
    setGoalData,
    requiredMonthlyInvestment,
    projectedData,
  };
};