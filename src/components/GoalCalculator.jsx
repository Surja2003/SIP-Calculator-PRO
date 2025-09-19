import { useState } from 'react';
import {
  Card,
  TextField,
  Typography,
  Box,
  Grid,
  InputAdornment,
  Button,
  CardContent,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CHART_COLORS } from '../constants/theme';
import FlagIcon from '@mui/icons-material/Flag';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import {
  FadeIn,
  SlideIn,
  AnimatedChart,
  AnimatedProgressBar,
  CountUp
} from './animations';

const GoalCalculator = () => {
  // Form data state - what user inputs
  const [formData, setFormData] = useState({
    targetAmount: 10000000,
    years: 15,
    expectedReturn: 12,
    includeInflation: false,
    inflation: 6
  });

  // Results state - only updated when Calculate button is clicked
  const [results, setResults] = useState({
    requiredMonthlyInvestment: 0,
    totalInvestment: 0,
    wealthGained: 0,
    returnPercentage: 0,
    inflationAdjustedTarget: 0,
    chartData: [],
    hasCalculated: false
  });

  // Handle input changes
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      targetAmount: value ? parseInt(value, 10) : 0
    }));
  };

  const handleInputChange = (field) => (e) => {
    // Ensure we're working with a valid numeric value
    let value;
    try {
      // Remove non-numeric characters except decimal point
      value = e.target.value.replace(/[^0-9.]/g, '');
      value = value !== '' ? Number(value) : 0;
      
      // If it's not a valid number, set to 0
      if (isNaN(value)) value = 0;
    } catch (error) {
      console.error("Error converting input to number:", error);
      value = 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  // Calculate button handler - this is where all calculations happen
  const handleCalculateClick = () => {
    // Ensure we have valid numbers
    const targetAmount = Number(formData.targetAmount) || 0;
    const years = Number(formData.years) || 0;
    const expectedReturn = Number(formData.expectedReturn) || 0;
    const inflation = formData.includeInflation ? (Number(formData.inflation) || 0) : 0;
    
    // Debug the input values
    console.log('Calculation inputs:', { 
      targetAmount, 
      years, 
      expectedReturn, 
      inflation,
      includeInflation: formData.includeInflation
    });
    
    // Don't calculate if invalid values
    if (targetAmount <= 0 || years <= 0) {
      console.log('Invalid inputs detected, aborting calculation');
      return;
    }
    
    // Calculate inflation-adjusted return rate
    const realRate = (1 + expectedReturn/100) / (1 + inflation/100) - 1;
    const monthlyRate = formData.includeInflation ? realRate / 12 : expectedReturn / (12 * 100);
    const totalMonths = years * 12;
    
    // Calculate inflation-adjusted target amount
    const inflationAdjustedTarget = formData.includeInflation 
      ? targetAmount * Math.pow(1 + inflation/100, years) // Adjust for inflation
      : targetAmount;
    
    // Calculate required monthly investment
    let requiredMonthlyInvestment;
    
    if (Math.abs(monthlyRate) < 0.00001) {
      // If rate is effectively zero, use simple division
      requiredMonthlyInvestment = inflationAdjustedTarget / totalMonths;
    } else {
      // Use compound interest formula: PMT = FV * r / ((1 + r)^n - 1)
      const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
      if (denominator <= 0) {
        // Fallback for negative rates
        requiredMonthlyInvestment = inflationAdjustedTarget / totalMonths;
      } else {
        requiredMonthlyInvestment = (inflationAdjustedTarget * monthlyRate) / denominator;
      }
    }
    
    // Calculate total investment
    const totalInvestment = requiredMonthlyInvestment * totalMonths;
    
    // Calculate wealth gained
    const wealthGained = inflationAdjustedTarget - totalInvestment;
    
    // Calculate return percentage
    const returnPercentage = totalInvestment > 0 ? (wealthGained / totalInvestment) * 100 : 0;
    
    // Generate chart data
    const chartData = generateChartData(
      years,
      requiredMonthlyInvestment,
      monthlyRate,
      totalMonths
    );
    
    // Calculate values for debugging
    const finalResults = {
      requiredMonthlyInvestment: Math.max(0, Math.round(requiredMonthlyInvestment)),
      totalInvestment: Math.max(0, Math.round(totalInvestment)),
      wealthGained: Math.max(0, Math.round(wealthGained)),
      returnPercentage: Math.max(0, returnPercentage),
      inflationAdjustedTarget: Math.max(0, Math.round(inflationAdjustedTarget)),
      originalTarget: targetAmount,
      chartData,
      hasCalculated: true
    };
    
    // Debug the output values
    console.log('Calculation results:', finalResults);
    
    // Update results state
    setResults(finalResults);
    
    // Scroll to results section
    setTimeout(() => {
      window.scrollTo({
        top: 300,
        behavior: 'smooth'
      });
    }, 100);
  };
  
  // Helper function to generate chart data
  const generateChartData = (years, monthlyInvestment, monthlyRate, totalMonths) => {
    const chartData = [];
    let currentValue = 0;
    
    try {
      for (let month = 0; month <= totalMonths; month++) {
        if (month === 0) {
          // Starting point
          chartData.push({
            year: "Year 0",
            'Required Investment': 0,
            'Expected Value': 0
          });
          continue;
        }
        
        if (Math.abs(monthlyRate) < 0.00001) {
          // Simple accumulation without interest
          currentValue = monthlyInvestment * month;
        } else {
          // Compound interest formula: FV = PMT * ((1 + r)^n - 1) / r * (1 + r)
          try {
            currentValue = monthlyInvestment * 
              ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate) * 
              (1 + monthlyRate);
          } catch (error) {
            // Fallback if math error
            currentValue = monthlyInvestment * month;
          }
        }
        
        // Add data point every 12 months
        if (month % 12 === 0) {
          const year = month / 12;
          chartData.push({
            year: "Year " + year,
            'Required Investment': Math.round(monthlyInvestment * month),
            'Expected Value': Math.round(currentValue)
          });
        }
      }
    } catch (error) {
      // Fallback chart data if any errors
      for (let year = 0; year <= years; year++) {
        chartData.push({
          year: "Year " + year,
          'Required Investment': Math.round(monthlyInvestment * year * 12),
          'Expected Value': Math.round(monthlyInvestment * year * 12 * (1 + (year * 0.05)))
        });
      }
    }
    
    return chartData;
  };
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <FlagIcon sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2" fontWeight="500">
          Investment Goal Calculator
        </Typography>
      </Box>
      
      <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
  <Grid container>
          {/* Input Section */}
          <Grid xs={12} md={5} sx={{ p: 3, borderRight: { md: '1px solid rgba(255,255,255,0.1)' }, order: { xs: 1, md: 1 } }}>
            <Typography variant="h6" mb={3} fontWeight="500">
              Set Your Financial Goal
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" mb={1} component="label" htmlFor="goal-target-amount">
                Target Amount
              </Typography>
              <TextField
                id="goal-target-amount"
                name="targetAmount"
                fullWidth
                variant="outlined"
                value={formData.targetAmount}
                onChange={handleAmountChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  sx: { borderRadius: 1 }
                }}
                size="small"
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" mb={1} component="label" htmlFor="goal-target-timeline">
                Target Timeline
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  id="goal-target-timeline"
                  name="years"
                  fullWidth
                  variant="outlined"
                  value={formData.years}
                  onChange={handleInputChange('years')}
                  inputProps={{ min: 1, max: 30 }}
                  size="small"
                  sx={{ flex: 1 }}
                  type="number"
                />
                <Box 
                  sx={{ 
                    bgcolor: 'background.paper', 
                    py: 1, 
                    px: 2, 
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Years
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" mb={1} component="label" htmlFor="goal-expected-return">
                Expected Return
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  id="goal-expected-return"
                  name="expectedReturn"
                  fullWidth
                  variant="outlined"
                  value={formData.expectedReturn}
                  onChange={handleInputChange('expectedReturn')}
                  inputProps={{ min: 1, max: 30, step: "0.1" }}
                  size="small"
                  sx={{ flex: 1 }}
                  type="number"
                />
                <Box 
                  sx={{ 
                    bgcolor: 'background.paper', 
                    py: 1, 
                    px: 2, 
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  %
                </Box>
              </Box>
            </Box>
            
            {/* Inflation Toggle and Input */}
            <Box sx={{ mb: 3 }}>
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={formData.includeInflation}
                      onChange={handleToggleChange('includeInflation')}
                      color="primary"
                      id="goal-include-inflation"
                      name="includeInflation"
                    />
                  } 
                  label={
                    <Typography variant="body2" component="span" color="text.secondary">
                      Account for Inflation
                    </Typography>
                  }
                  htmlFor="goal-include-inflation"
                />
              </FormGroup>
              
              {formData.includeInflation && (
                <FadeIn>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" component="label" htmlFor="goal-inflation-rate">
                        Inflation Rate
                      </Typography>
                      <Box sx={{ 
                        bgcolor: 'rgba(239, 68, 68, 0.2)',
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1, 
                        display: 'inline-block' 
                      }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ color: '#EF4444' }}>
                          {formData.inflation}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ px: 1 }}>
                      <input
                        id="goal-inflation-rate"
                        name="inflation"
                        type="range"
                        min={1}
                        max={15}
                        value={formData.inflation}
                        onChange={(e) => setFormData(prev => ({...prev, inflation: Number(e.target.value)}))}
                        style={{ width: '100%' }}
                      />
                    </Box>
                    <AnimatedProgressBar 
                      value={formData.inflation} 
                      max={15} 
                      duration={0.5}
                      height={4}
                      foregroundColor="#EF4444"
                    />
                  </Box>
                </FadeIn>
              )}
            </Box>
            
            <Button 
              id="goal-calculate-button"
              name="calculate"
              fullWidth 
              variant="contained" 
              color="primary" 
              startIcon={<CalculateIcon />}
              onClick={handleCalculateClick}
              sx={{ 
                mt: 2, 
                bgcolor: '#4CAF50', 
                '&:hover': { bgcolor: '#43A047' },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(76, 175, 80, 0.4)'
              }}
            >
              Calculate Required SIP
            </Button>
          </Grid>
          
          {/* Right Panel - Quick View */}
          <Grid xs={12} md={7} sx={{ p: 3, order: { xs: 2, md: 2 } }}>
            <Typography variant="h6" mb={3} fontWeight="500">
              Required Investment
            </Typography>
            
            {results.hasCalculated && results.requiredMonthlyInvestment > 0 ? (
              <FadeIn>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <SlideIn direction="up">
                    <Typography variant="h4" color="primary" fontWeight="bold" mb={2}>
                      ₹<CountUp to={results.requiredMonthlyInvestment || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toLocaleString('en-IN')} />
                    </Typography>
                  </SlideIn>
                  <Typography variant="body1" mb={3}>
                    Monthly SIP required to reach your goal
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Target Amount
                        </Typography>
                        <SlideIn direction="up">
                          <Typography variant="body1" fontWeight="500">
                            ₹<CountUp to={formData.targetAmount || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toLocaleString('en-IN')} />
                          </Typography>
                        </SlideIn>
                      </Box>
                    </Grid>
                    <Grid xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Timeline
                        </Typography>
                        <SlideIn direction="up">
                          <Typography variant="body1" fontWeight="500">
                            {formData.years} years
                          </Typography>
                        </SlideIn>
                      </Box>
                    </Grid>
                    <Grid xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Return Rate
                        </Typography>
                        <SlideIn direction="up">
                          <Typography variant="body1" fontWeight="500">
                            {formData.expectedReturn}%
                          </Typography>
                        </SlideIn>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </FadeIn>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                py: 5
              }}>
                <FlagIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  Enter your financial goal to calculate required SIP
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Results Card */}
      {results.hasCalculated && results.requiredMonthlyInvestment > 0 && (
        <FadeIn>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={3} fontWeight="500">
                Goal Calculator Results
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Required Monthly SIP
                  </Typography>
                  <SlideIn direction="up">
                    <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                      ₹<CountUp to={results.requiredMonthlyInvestment || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toLocaleString('en-IN')} />
                    </Typography>
                  </SlideIn>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Total Investment
                  </Typography>
                  <SlideIn direction="up">
                    <Typography variant="h5" fontWeight="medium">
                      ₹<CountUp to={results.totalInvestment || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toLocaleString('en-IN')} />
                    </Typography>
                  </SlideIn>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Inflation section */}
              {formData.includeInflation && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Target Amount
                      </Typography>
                      <SlideIn direction="up">
                        <Typography variant="h5" fontWeight="medium">
                          ₹<CountUp to={formData.targetAmount || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toLocaleString('en-IN')} />
                        </Typography>
                      </SlideIn>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Inflation-Adjusted Target
                      </Typography>
                      <SlideIn direction="up">
                        <Typography variant="h5" fontWeight="medium" color="#EF4444">
                          ₹<CountUp to={results.inflationAdjustedTarget || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toLocaleString('en-IN')} />
                        </Typography>
                      </SlideIn>
                    </Box>
                  </Box>
                  
                  <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1, color: '#EF4444' }} />
                      With {formData.inflation}% inflation, your target of ₹{formData.targetAmount.toLocaleString()} today will cost ₹{results.inflationAdjustedTarget.toLocaleString()} after {formData.years} years.
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                </>
              )}
              
              {/* Returns section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Returns Generated
                  </Typography>
                  <SlideIn direction="up">
                    <Typography variant="h5" fontWeight="medium" color="#2196F3">
                      ₹<CountUp to={results.wealthGained || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toLocaleString('en-IN')} />
                    </Typography>
                  </SlideIn>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Returns %
                  </Typography>
                  <SlideIn direction="up">
                    <Typography variant="h5" fontWeight="medium" color="#2196F3">
                      <CountUp to={results.returnPercentage || 0} duration={1} formatter={(value) => (typeof value === 'number' ? value : 0).toFixed(2)} />%
                    </Typography>
                  </SlideIn>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Chart Card */}
      {results.hasCalculated && results.requiredMonthlyInvestment > 0 && (
        <FadeIn>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight="500">
                Investment Growth Projection
              </Typography>
              <AnimatedChart>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Area
                        type="monotone"
                        dataKey="Required Investment"
                        stroke={CHART_COLORS.invested}
                        fill={CHART_COLORS.invested}
                        fillOpacity={0.3}
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="Expected Value"
                        stroke={CHART_COLORS.returns}
                        fill={CHART_COLORS.returns}
                        fillOpacity={0.3}
                        stackId="1"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </AnimatedChart>
              
              {formData.includeInflation && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1, color: '#2196F3' }} />
                    This chart shows the growth of your investment adjusted for inflation at {formData.inflation}% per year.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </Box>
  );
};

export default GoalCalculator;