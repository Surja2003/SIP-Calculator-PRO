import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, 
  Box, 
  useTheme,
  Tabs,
  Tab,
  CardContent
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  ) : null;
};

const SWPBreakdown = ({ customScenarios = null, selectedScenario: propSelectedScenario = 'moderate' }) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(propSelectedScenario);

  const defaultScenarios = {
    conservative: {
      name: 'Conservative',
      return: 8,
      years: 20,
      monthlyWithdrawal: 10000,
      principal: 2000000
    },
    moderate: {
      name: 'Moderate',
      return: 12,
      years: 20,
      monthlyWithdrawal: 10000,
      principal: 2000000
    },
    aggressive: {
      name: 'Aggressive',
      return: 15,
      years: 20,
      monthlyWithdrawal: 10000,
      principal: 2000000
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
    const monthlyRate = scenario.return / (12 * 100);
    const totalMonths = scenario.years * 12;
    const principal = scenario.principal || 2000000;
    const monthlyWithdrawal = scenario.monthlyWithdrawal || 10000;

    // For SWP, we calculate remaining corpus and total withdrawals
    let remainingCorpus = principal;
    let totalWithdrawals = 0;
    
    for (let month = 1; month <= totalMonths; month++) {
      // First withdraw, then apply interest
      remainingCorpus -= monthlyWithdrawal;
      remainingCorpus = remainingCorpus * (1 + monthlyRate);
      totalWithdrawals += monthlyWithdrawal;
      
      // Stop if corpus is depleted
      if (remainingCorpus <= 0) {
        remainingCorpus = 0;
        break;
      }
    }
    
    // Calculate percentages
    const totalValue = remainingCorpus + totalWithdrawals;
    const corpusPercentage = (remainingCorpus / totalValue) * 100;
    const withdrawalsPercentage = (totalWithdrawals / totalValue) * 100;
    
    const data = [
      { 
        name: 'Remaining Corpus', 
        value: remainingCorpus, 
        percentage: corpusPercentage,
        fill: theme.palette.primary.main
      },
      { 
        name: 'Total Withdrawn', 
        value: totalWithdrawals, 
        percentage: withdrawalsPercentage,
        fill: theme.palette.success.main
      }
    ];

    return { 
      data,
      remainingCorpus: Math.round(remainingCorpus),
      totalWithdrawals: Math.round(totalWithdrawals),
      totalValue: Math.round(totalValue),
      corpusPercentage: corpusPercentage.toFixed(1),
      withdrawalsPercentage: withdrawalsPercentage.toFixed(1),
      monthlyWithdrawal: monthlyWithdrawal,
      years: scenario.years,
      returnRate: scenario.return,
      principal: principal
    };
  }, [selectedScenario, scenarios, theme.palette]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSelectedScenario(scenarioKeys[newValue]);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="SWP scenario tabs"
        variant="fullWidth"
        sx={{
          '.MuiTabs-indicator': {
            backgroundColor: selectedTab === 0 
              ? COLORS.conservative[0]
              : selectedTab === 1
                ? COLORS.moderate[0]
                : COLORS.aggressive[0]
          },
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        {scenarioKeys.map((key, index) => (
          <Tab
            key={key}
            label={scenarios[key].name}
            sx={{
              fontWeight: 'medium',
              color: selectedTab === index 
                ? (selectedTab === 0 
                  ? COLORS.conservative[0]
                  : selectedTab === 1
                    ? COLORS.moderate[0] 
                    : COLORS.aggressive[0])
                : 'text.secondary'
            }}
          />
        ))}
      </Tabs>
      
      <Box sx={{ pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, pt: 2 }}>
          <Typography variant="h4" align="center" fontWeight="500" sx={{ mb: 0.5 }}>
            {formatCurrency(calculations.totalValue)}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Total Value (Principal + Growth - Withdrawals)
          </Typography>
        </Box>
        
        <Box sx={{ height: 200, width: '100%', mb: 3 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={calculations.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {calculations.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  mr: 1,
                  backgroundColor: theme.palette.primary.main
                }} 
              />
              <Typography variant="body2" color="text.secondary">Remaining Corpus</Typography>
            </Box>
            <Typography variant="h6" fontWeight="medium">
              {formatCurrency(calculations.remainingCorpus)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {calculations.corpusPercentage}%
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  mr: 1,
                  backgroundColor: theme.palette.success.main
                }} 
              />
              <Typography variant="body2" color="text.secondary">Total Withdrawn</Typography>
            </Box>
            <Typography variant="h6" fontWeight="medium">
              {formatCurrency(calculations.totalWithdrawals)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {calculations.withdrawalsPercentage}%
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Monthly Withdrawal</Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatCurrency(calculations.monthlyWithdrawal)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Return Rate</Typography>
            <Typography variant="body2" fontWeight="medium">{calculations.returnRate}% p.a.</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Duration</Typography>
            <Typography variant="body2" fontWeight="medium">{calculations.years} Years</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SWPBreakdown;