import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Box, 
  Grid,
  useTheme,
  Tabs,
  Tab,
  CardContent
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const COLORS = {
  conservative: ['#00C49F', '#0088FE'],
  moderate: ['#FFBB28', '#FF8042'],
  aggressive: ['#FF6B8B', '#8884D8']
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const InvestmentBreakdown = ({ customScenarios = null, selectedScenario: propSelectedScenario = 'moderate', calculatorType = 'sip' }) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(propSelectedScenario);

  const defaultScenarios = {
    conservative: {
      name: 'Conservative',
      return: 8,
      years: 20,
      monthlyAmount: 10000,
    },
    moderate: {
      name: 'Moderate',
      return: 12,
      years: 20,
      monthlyAmount: 10000,
    },
    aggressive: {
      name: 'Aggressive',
      return: 15,
      years: 20,
      monthlyAmount: 10000,
    }
  };

  // Use custom scenarios if provided, otherwise use default
  const scenarios = customScenarios || defaultScenarios;
  const scenarioKeys = Object.keys(scenarios);
  
  // Keep in sync with parent component's selected scenario
  useEffect(() => {
    setSelectedScenario(propSelectedScenario);
    // Update tab index based on scenario
    const scenarioIndex = scenarioKeys.indexOf(propSelectedScenario);
    if (scenarioIndex !== -1) {
      setSelectedTab(scenarioIndex);
    }
  }, [propSelectedScenario, scenarioKeys]);
  
  const calculations = useMemo(() => {
    const scenario = scenarios[selectedScenario];
    const includeInflation = scenario.includeInflation || false;
    const inflationRate = scenario.inflationRate || 6;
    const years = scenario.years;
    const rate = scenario.return;

    // Lumpsum: treat monthlyAmount as the one-time principal
    if (calculatorType === 'lumpsum') {
      const principal = Number(scenario.monthlyAmount) || 0;
      // Adjust rate for inflation if requested
      const effectiveAnnualRate = includeInflation
        ? ((1 + rate / 100) / (1 + inflationRate / 100) - 1)
        : (rate / 100);
      // Use monthly compounding to match ScenarioComparison and charts
      const monthlyRate = effectiveAnnualRate / 12;
      const months = years * 12;
      const futureValue = principal * Math.pow(1 + monthlyRate, months);
      const totalInvestment = principal;
      const totalReturns = futureValue - totalInvestment;

      const safeFV = isFinite(futureValue) ? futureValue : 0;
      const investmentPercentage = safeFV > 0 ? (totalInvestment / safeFV) * 100 : 0;
      const returnsPercentage = safeFV > 0 ? (totalReturns / safeFV) * 100 : 0;

      const data = [
        { name: 'Investment', value: totalInvestment, percentage: investmentPercentage, fill: theme.palette.secondary.main },
        { name: 'Returns', value: totalReturns, percentage: returnsPercentage, fill: theme.palette.success.main }
      ];

      return {
        data,
        totalInvestment: Math.round(totalInvestment),
        totalReturns: Math.round(totalReturns),
        futureValue: Math.round(safeFV),
        investmentPercentage: investmentPercentage.toFixed(1),
        returnsPercentage: returnsPercentage.toFixed(1),
        monthlyAmount: principal,
        years,
        returnRate: rate
      };
    }

    // SIP path (existing behavior)
    const monthlyAmount = scenario.monthlyAmount;
    const totalMonths = years * 12;
    const isStepUpSIP = scenario.isStepUpSIP || false;
    const stepUpPercentage = scenario.stepUpPercentage || 10;
    const stepUpFrequency = scenario.stepUpFrequency || 12; // Default to yearly

    // Calculate future value with inflation and step-up SIP
    let futureValue = 0;
    let totalInvestment = 0;
    let currentMonthlyAmount = monthlyAmount;

    // Apply inflation adjustment to return rate if needed
    let effectiveRate = rate;
    if (includeInflation) {
      effectiveRate = ((1 + rate / 100) / (1 + inflationRate / 100) - 1) * 100;
    }
    const effectiveMonthlyRate = effectiveRate / 100 / 12;

    if (isStepUpSIP) {
      for (let month = 1; month <= totalMonths; month++) {
        if (month > 1 && month % stepUpFrequency === 1) {
          currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpPercentage / 100);
        }
        totalInvestment += currentMonthlyAmount;
        futureValue = (futureValue + currentMonthlyAmount) * (1 + effectiveMonthlyRate);
      }
    } else {
      futureValue = monthlyAmount * (((Math.pow(1 + effectiveMonthlyRate, totalMonths) - 1) / effectiveMonthlyRate) * (1 + effectiveMonthlyRate));
      totalInvestment = monthlyAmount * totalMonths;
    }

    const totalReturns = futureValue - totalInvestment;
    const safeFV = isFinite(futureValue) ? futureValue : 0;
    const investmentPercentage = safeFV > 0 ? (totalInvestment / safeFV) * 100 : 0;
    const returnsPercentage = safeFV > 0 ? (totalReturns / safeFV) * 100 : 0;

    const data = [
      { name: 'Investment', value: totalInvestment, percentage: investmentPercentage, fill: theme.palette.secondary.main },
      { name: 'Returns', value: totalReturns, percentage: returnsPercentage, fill: theme.palette.success.main }
    ];

    return {
      data,
      totalInvestment: Math.round(totalInvestment),
      totalReturns: Math.round(totalReturns),
      futureValue: Math.round(safeFV),
      investmentPercentage: investmentPercentage.toFixed(1),
      returnsPercentage: returnsPercentage.toFixed(1),
      monthlyAmount: monthlyAmount,
      years,
      returnRate: rate
    };
  }, [selectedScenario, scenarios, theme.palette, calculatorType]);

  // For direct dropdown selection if needed
  const _handleScenarioChange = (event) => {
    setSelectedScenario(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSelectedScenario(scenarioKeys[newValue]);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card sx={{ 
          p: 1.5, 
          border: 'none', 
          boxShadow: theme.shadows[10], 
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
          color: theme.palette.text.primary
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ₹{data.value.toLocaleString()}
          </Typography>
          <Typography 
            variant="body2" 
            color={data.name === 'Investment' ? 'secondary.main' : 'success.main'}
          >
            {data.percentage}%
          </Typography>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card sx={{ 
      borderRadius: 2, 
      overflow: 'hidden', 
      height: '100%',
      bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 3, 
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` 
      }}>
        <AccessTimeIcon sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2" fontWeight="500">
          Investment vs Returns Breakdown
        </Typography>
      </Box>
      
      <CardContent>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            mb: 3, 
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            '& .MuiTab-root': {
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
            }
          }}
        >
          {scenarioKeys.map((key, index) => (
            <Tab 
              key={key} 
              label={scenarios[key].name} 
              sx={{ 
                textTransform: 'none',
                fontWeight: selectedTab === index ? 600 : 400,
                fontSize: '0.875rem' 
              }}
            />
          ))}
        </Tabs>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={calculations.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    strokeWidth={2}
                    stroke={theme.palette.background.paper}
                  >
                    {calculations.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center' 
            }}>
              <Typography variant="h5" mb={3} fontWeight="500">
                ₹{calculations.futureValue.toLocaleString()}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: theme.palette.secondary.main, 
                      mr: 1 
                    }} />
                    <Typography variant="body2">Investment</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="500">
                    {calculations.investmentPercentage}%
                  </Typography>
                </Box>
                <Typography variant="h6" color="secondary.main">
                  ₹{calculations.totalInvestment.toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: theme.palette.success.main, 
                      mr: 1 
                    }} />
                    <Typography variant="body2">Returns</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="500">
                    {calculations.returnsPercentage}%
                  </Typography>
                </Box>
                <Typography variant="h6" color="success.main">
                  ₹{calculations.totalReturns.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'space-between', 
              gap: 2, 
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {calculatorType === 'lumpsum' ? 'Initial Investment' : 'Monthly SIP'}
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  ₹{calculations.monthlyAmount.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Timeline
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {calculations.years} years
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Return Rate
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {calculations.returnRate}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  XIRR
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {calculations.returnRate}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvestmentBreakdown;