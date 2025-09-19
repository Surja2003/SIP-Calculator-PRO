import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Box, 
  Grid,
  TextField,
  InputAdornment,
  LinearProgress,
  useTheme,
  Divider,
  CardContent
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../constants/theme';
import BarChartIcon from '@mui/icons-material/BarChart';
import Range from './Range';
import { CountUp } from './animations';

const SCENARIOS = {
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

const ScenarioComparison = ({ 
  defaultAmount = 10000, 
  defaultDuration = 20,
  selectedScenario = 'moderate',
  calculatorType = 'sip', // 'sip', 'lumpsum', or 'swp'
  onScenarioChange = () => {},
  includeInflation = false,
  inflationRate = 6,
  isStepUpSIP = false,
  stepUpPercentage = 10,
  stepUpFrequency = 12,
  initialPrincipal = 0 // used for SWP
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    monthlyInvestment: defaultAmount,
    years: defaultDuration,
  });
  
  // Get the title based on calculator type
  const getTitle = () => {
    switch(calculatorType.toLowerCase()) {
      case 'lumpsum':
        return 'Lumpsum Scenarios Comparison';
      case 'swp':
        return 'SWP Scenarios Comparison';
      case 'sip':
      default:
        return 'SIP Scenarios Comparison';
    }
  };
  
  // Update local state when props change
  useEffect(() => {
    setFormData({
      monthlyInvestment: defaultAmount,
      years: defaultDuration
    });
  }, [defaultAmount, defaultDuration]);
  
  // Track active scenario
  const [activeScenario, setActiveScenario] = useState(selectedScenario);
  
  // Keep active scenario in sync with parent component
  useEffect(() => {
    setActiveScenario(selectedScenario);
  }, [selectedScenario]);
  
  // Handle scenario selection
  const handleScenarioSelect = (scenarioKey, scenarioReturn) => {
    setActiveScenario(scenarioKey);
    // Call the parent component's callback with selected scenario info
    onScenarioChange(scenarioKey, scenarioReturn);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      monthlyInvestment: value
    }));
  };

  const handleRangeChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculations = useMemo(() => {
    console.log('ScenarioComparison calculating with:', { 
      calculatorType, 
      monthlyInvestment: formData.monthlyInvestment, 
      years: formData.years 
    });
    
    const totalMonths = formData.years * 12;
    const monthlyInvestment = Number(formData.monthlyInvestment) || 100000; // Default to 100,000 if value is missing
    const chartData = [];
    const results = {};

    // Calculate for each scenario
    for (let month = 0; month <= totalMonths; month++) {
      const dataPoint = {
        month: month,
        year: "Year " + Math.floor(month / 12),
      };

  Object.entries(SCENARIOS).forEach(([key, scenario]) => {
        // Apply inflation adjustment to return rate if needed
        let effectiveRate = scenario.return;
        if (includeInflation) {
          effectiveRate = ((1 + scenario.return / 100) / (1 + inflationRate / 100) - 1) * 100;
        }
        const monthlyRate = effectiveRate / (12 * 100);
        
        // Initialize data for this scenario if it's the first month
        if (month === 0) {
          if (calculatorType === 'lumpsum') {
            // Lumpsum starts with principal equal to amount
            results[key] = {
              monthlyRate,
              currentValue: monthlyInvestment,
              totalInvestment: monthlyInvestment,
              currentMonthlyAmount: 0
            };
            dataPoint[scenario.name] = monthlyInvestment;
          } else if (calculatorType === 'swp') {
            // SWP starts with initial principal and withdraws monthly
            const principal = Number(initialPrincipal) || 0;
            results[key] = {
              monthlyRate,
              currentValue: principal,
              totalInvestment: principal, // keep principal constant for display
              currentMonthlyAmount: monthlyInvestment
            };
            dataPoint[scenario.name] = principal;
          } else {
            // SIP starts from zero and accumulates
            results[key] = {
              monthlyRate,
              currentValue: 0,
              totalInvestment: 0,
              currentMonthlyAmount: monthlyInvestment
            };
            dataPoint[scenario.name] = 0;
          }
        } else {
          // Apply step-up at specified frequency (e.g., every 12 months)
          if (isStepUpSIP && month > 1 && month % stepUpFrequency === 1 && calculatorType !== 'lumpsum') {
            results[key].currentMonthlyAmount = results[key].currentMonthlyAmount * (1 + stepUpPercentage / 100);
          }

          // Calculate growth based on calculator type
          if (calculatorType === 'lumpsum') {
            // For lumpsum, just apply compounding without additional investment
            results[key].currentValue = results[key].currentValue * (1 + monthlyRate);
          } else if (calculatorType === 'swp') {
            // For SWP, withdraw monthly then apply growth; keep totalInvestment constant as initial principal
            results[key].currentValue = (results[key].currentValue - results[key].currentMonthlyAmount);
            // Prevent negative before growth
            if (results[key].currentValue < 0) results[key].currentValue = 0;
            results[key].currentValue = results[key].currentValue * (1 + monthlyRate);
          } else {
            // For SIP, add monthly investment and apply growth
            results[key].currentValue = (results[key].currentValue + results[key].currentMonthlyAmount) * (1 + monthlyRate);
            results[key].totalInvestment += results[key].currentMonthlyAmount;
          }
          
          // Store the value for charting at year intervals
          if (month % 12 === 0) {
            dataPoint[scenario.name] = Math.round(results[key].currentValue);
          }
        }
      });

      if (month % 12 === 0) {
        chartData.push(dataPoint);
      }
    }

    // Build custom scenarios for InvestmentBreakdown
    const customScenarios = {};
    Object.entries(SCENARIOS).forEach(([key, scenario]) => {
      customScenarios[key] = {
        name: scenario.name,
        return: scenario.return,
        years: formData.years,
        monthlyAmount: monthlyInvestment,
        includeInflation: includeInflation,
        inflationRate: inflationRate,
        isStepUpSIP: isStepUpSIP,
        stepUpPercentage: stepUpPercentage,
        stepUpFrequency: stepUpFrequency
      };
    });

    // Make sure all final amounts have valid numbers
    const scenarios = Object.entries(SCENARIOS).map(([key, scenario]) => {
      // For lumpsum, calculate directly as a fallback to ensure we get valid numbers
      let finalAmount = 0;
      let totalInvestment = 0;
      
      if (calculatorType === 'lumpsum' && (!results[key] || !results[key].currentValue)) {
        // Direct calculation for lumpsum as fallback using monthly compounding
        totalInvestment = monthlyInvestment;
        const years = formData.years || 1;
        const annualRate = scenario.return / 100;
        const monthlyRate = annualRate / 12;
        finalAmount = Math.round(monthlyInvestment * Math.pow(1 + monthlyRate, years * 12));
      } else {
        // Use calculated values when available
        finalAmount = Math.max(0, Math.round(results[key]?.currentValue || 0));
        totalInvestment = Math.max(0, results[key]?.totalInvestment || 0);
      }
      
      const totalGains = Math.max(0, finalAmount - totalInvestment);
      
      return {
        ...scenario,
        finalAmount,
        totalInvestment,
        totalGains,
      };
    });

    console.log('ScenarioComparison calculated results:', {
      calculatorType,
      formData,
      scenarios
    });

    return {
      chartData,
      customScenarios,
      scenarios,
    };
  }, [formData, includeInflation, inflationRate, isStepUpSIP, stepUpPercentage, stepUpFrequency, calculatorType]);

  return (
    <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BarChartIcon sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2" fontWeight="500">
          {getTitle()}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Scenario Cards */}
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            {calculations.scenarios.map((scenario) => {
              const scenarioKey = scenario.name.toLowerCase();
              const isActive = activeScenario === scenarioKey;
              const returnColor = 
                scenario.name === 'Conservative' ? '#6B7280' : 
                scenario.name === 'Moderate' ? '#3B82F6' : '#EF4444';
                
              return (
                <Box key={scenario.name}>
                  <Card 
                    onClick={() => handleScenarioSelect(scenarioKey, SCENARIOS[scenarioKey].return)}
                    sx={{ 
                      p: 0, 
                      overflow: 'hidden',
                      bgcolor: isActive ? `${returnColor}10` : theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: isActive ? `2px solid ${returnColor}` : `2px solid ${theme.palette.mode === 'dark' ? 'transparent' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: `${returnColor}10`,
                        boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'background.paper', 
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="500">
                          {scenario.name}
                        </Typography>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: returnColor,
                            bgcolor: `${returnColor}20`,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 5
                          }}
                        >
                          {scenario.return}% Return
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {calculatorType === 'swp' ? 'Monthly Withdrawal:' : calculatorType === 'lumpsum' ? 'Initial Investment:' : 'Monthly SIP:'}
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            ₹{Number(formData.monthlyInvestment).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Duration:
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {formData.years} years
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Maturity:
                          </Typography>
                          <Typography variant="h6" sx={{ color: returnColor, fontWeight: 'bold' }}>
                            ₹<CountUp 
                               to={scenario.finalAmount || 0} 
                               formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                               duration={0.6}
                             />
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        sx={{ 
                          mt: 2, 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'background.default',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: returnColor
                          }
                        }} 
                      />
                    </Box>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Calculator and Chart */}
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, gap: 3 }}>
            {/* Calculator Inputs */}
            <Box>
              <Card sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" mb={3} fontWeight="500">
                  Compare Scenarios
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label={calculatorType === 'swp' ? "Monthly Withdrawal" : calculatorType === 'lumpsum' ? "Initial Investment" : "Monthly Investment"}
                    value={formData.monthlyInvestment}
                    onChange={handleAmountChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    size="small"
                  />
                  <Range
                    id="years"
                    label="Investment Duration"
                    value={formData.years}
                    min={1}
                    max={30}
                    onChange={handleRangeChange('years')}
                    suffix=" Years"
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Return Rates</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(SCENARIOS).map(([key, scenario]) => (
                      <Box key={key}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{scenario.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {scenario.return}% p.a.
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
            </Box>

            {/* Chart */}
            <Box>
              <Card sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="h6" fontWeight="500">
                    Growth Comparison
                  </Typography>
                </Box>
                <CardContent sx={{ height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={calculations.chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        {Object.entries(SCENARIOS).map(([key, scenario]) => {
                          const color = 
                            scenario.name === 'Conservative' ? '#6B7280' : 
                            scenario.name === 'Moderate' ? '#3B82F6' : '#EF4444';
                          
                          return (
                            <linearGradient key={key} id={`color${scenario.name}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <XAxis 
                        dataKey="year" 
                        axisLine={{ stroke: theme.palette.divider }}
                        tickLine={{ stroke: theme.palette.divider }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                        axisLine={{ stroke: theme.palette.divider }}
                        tickLine={{ stroke: theme.palette.divider }}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString()}`, `Value`]} 
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper, 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: 8 
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      {Object.entries(SCENARIOS).map(([key, scenario]) => {
                        const color = 
                          scenario.name === 'Conservative' ? '#6B7280' : 
                          scenario.name === 'Moderate' ? '#3B82F6' : '#EF4444';
                        
                        return (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={scenario.name}
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={0.1}
                            fill={`url(#color${scenario.name})`}
                            dot={{ stroke: color, strokeWidth: 2, r: 4, fill: theme.palette.background.paper }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ScenarioComparison;