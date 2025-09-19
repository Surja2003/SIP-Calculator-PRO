import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Grid, 
  Button, 
  Slider,
  Box,
  Divider,
  Tabs,
  Tab,
  InputAdornment,
  useTheme,
  LinearProgress
} from '@mui/material';
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ProjectionChartLW from './ProjectionChartLW';
import SWPBreakdown from './SWPBreakdown';
import ScenarioComparison from './ScenarioComparison';
import { 
  FadeIn, 
  SlideIn, 
  AnimatedCounter, 
  AnimatedText,
  CountUp,
  AnimatedProgressBar,
  AnimatedChart
} from './animations';

const SWPCalculator = () => {
  const theme = useTheme();
  // State for all form inputs combined in one object to prevent circular dependencies
  const [formInputs, setFormInputs] = useState({
    initialInvestment: 1000000,
    withdrawalRate: 4,
    withdrawalAmount: 40000,
    expectedReturn: 8,
    withdrawalPeriod: 20,
    withdrawalFrequency: 'monthly',
    inflationRate: 3,
    adjustForInflation: false,
    _timestamp: Date.now() // Add timestamp to force re-renders
  });
  
  // Use React.useRef to keep track of which field was last updated
  const lastUpdatedField = React.useRef(null);
  
  // State for calculation results
  const [calculationResults, setCalculationResults] = useState({
    finalCorpus: 0,
    totalWithdrawals: 0,
    scheduledTotalWithdrawals: 0,
    depletedAtYears: null,
    chartData: []
  });
  
  // UI state
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // Destructure values from state for easier access in component
  const { 
    initialInvestment, 
    withdrawalRate, 
    withdrawalAmount, 
    expectedReturn, 
    withdrawalPeriod, 
    withdrawalFrequency, 
    inflationRate,
    adjustForInflation
  } = formInputs;
  
  const { finalCorpus, totalWithdrawals, scheduledTotalWithdrawals, depletedAtYears, chartData } = calculationResults;
  
  // Handle initial investment change
  const handleInitialInvestmentChange = (value) => {
    const newValue = Math.max(0, Number(value));
    lastUpdatedField.current = 'initialInvestment';
    
    setFormInputs(prev => {
      // Calculate new withdrawal amount based on rate
      const newWithdrawalAmount = (newValue * prev.withdrawalRate) / 100;
      
      return {
        ...prev,
        initialInvestment: newValue,
        withdrawalAmount: newWithdrawalAmount,
        _timestamp: Date.now() // Add timestamp to force re-render
      };
    });
  };
  
  // Handle withdrawal rate change
  const handleWithdrawalRateChange = (value) => {
    const newRate = Number(value);
    lastUpdatedField.current = 'withdrawalRate';
    
    setFormInputs(prev => {
      // Calculate new withdrawal amount based on new rate
      const newWithdrawalAmount = (prev.initialInvestment * newRate) / 100;
      
      return {
        ...prev,
        withdrawalRate: newRate,
        withdrawalAmount: newWithdrawalAmount,
        _timestamp: Date.now() // Add timestamp to force re-render
      };
    });
  };
  
  // Handle withdrawal amount change
  const handleWithdrawalAmountChange = (value) => {
    const newAmount = Math.max(0, Number(value));
    lastUpdatedField.current = 'withdrawalAmount';
    
    setFormInputs(prev => {
      // Calculate new rate based on amount
      let newRate = 0;
      if (prev.initialInvestment > 0) {
        newRate = (newAmount / prev.initialInvestment) * 100;
      }
      
      return {
        ...prev,
        withdrawalAmount: newAmount,
        withdrawalRate: newRate,
        _timestamp: Date.now() // Add timestamp to force re-render
      };
    });
  };
  
  // Handle other form input changes
  const handleInputChange = (field, value) => {
    lastUpdatedField.current = field;
    setFormInputs(prev => ({ 
      ...prev, 
      [field]: value,
      _timestamp: Date.now() // Add timestamp to force re-render
    }));
  };
  
  // Calculate SWP results when the component mounts and whenever form inputs change
  useEffect(() => {
    console.log('SWP Calculator - useEffect triggered with inputs:', formInputs);
    
    // Initial render relies on calculateSWP for consistency with monthly/periodic compounding
    
    // Immediate calculation on mount and input changes
    calculateSWP(formInputs);
    
    // Delayed recalculation to handle any input debouncing needed
    const timer = setTimeout(() => {
      calculateSWP(formInputs);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [formInputs]);
  
  const calculateSWP = (inputs) => {
    console.log('Calculating SWP with inputs:', inputs);

    // Validate inputs
    if (inputs.initialInvestment <= 0 || inputs.withdrawalAmount <= 0) {
      setCalculationResults({ chartData: [], finalCorpus: 0, totalWithdrawals: 0, scheduledTotalWithdrawals: 0, depletedAtYears: null });
      return;
    }

    let corpus = Number(inputs.initialInvestment);
    let totalWithdrawn = 0;
    const data = [];

    // Period configuration
    const withdrawalsPerYear =
      inputs.withdrawalFrequency === 'monthly' ? 12 :
      inputs.withdrawalFrequency === 'quarterly' ? 4 :
      inputs.withdrawalFrequency === 'half-yearly' ? 2 : 1;
  const totalPeriods = inputs.withdrawalPeriod * withdrawalsPerYear;

  // Per-period rates (monthly/periodic using nominal division for consistency across app)
  const returnPerPeriod = (inputs.expectedReturn / 100) / withdrawalsPerYear;
  const inflationPerPeriod = (inputs.inflationRate / 100) / withdrawalsPerYear;

    // Start with provided withdrawal amount (fixed unless inflation-adjusted)
    let currentWithdrawalAmount = Number(inputs.withdrawalAmount);
    // Compute scheduled total withdrawals (ignoring corpus depletion)
    let scheduledTotalWithdrawals = 0;
    if (inputs.adjustForInflation) {
      if (inflationPerPeriod === 0) {
        scheduledTotalWithdrawals = currentWithdrawalAmount * totalPeriods;
      } else {
        scheduledTotalWithdrawals = currentWithdrawalAmount * ((Math.pow(1 + inflationPerPeriod, totalPeriods) - 1) / inflationPerPeriod);
      }
    } else {
      scheduledTotalWithdrawals = currentWithdrawalAmount * totalPeriods;
    }

    let depletionPeriod = null;

    // Initial data point (Year 0)
    data.push({ year: 0, period: 0, corpus, withdrawal: 0, totalWithdrawn });

    for (let p = 1; p <= totalPeriods; p++) {
      // Withdraw first, then apply growth (align with breakdown logic)
      const withdrawThisPeriod = Math.min(corpus, currentWithdrawalAmount);
      corpus -= withdrawThisPeriod;
      totalWithdrawn += withdrawThisPeriod;

      // If corpus is depleted, record and stop
      if (corpus <= 0) {
        depletionPeriod = p;
        if (p % withdrawalsPerYear === 0 || p === totalPeriods) {
          const yearMarker = p / withdrawalsPerYear;
          data.push({
            year: yearMarker,
            period: p % withdrawalsPerYear,
            corpus,
            withdrawal: currentWithdrawalAmount,
            totalWithdrawn
          });
        }
        break;
      }

      // Apply growth for the period on remaining corpus
      corpus *= 1 + returnPerPeriod;

      // Prepare next period's withdrawal if inflation adjustment is enabled
      if (inputs.adjustForInflation) {
        currentWithdrawalAmount *= 1 + inflationPerPeriod;
      }

      // Log yearly points (or the final period)
      if (p % withdrawalsPerYear === 0 || p === totalPeriods) {
        const yearMarker = p / withdrawalsPerYear;
        data.push({
          year: yearMarker,
          period: p % withdrawalsPerYear,
          corpus,
          withdrawal: currentWithdrawalAmount,
          totalWithdrawn
        });
      }
      // continue until loop ends or corpus depleted above
    }

    const results = { 
      chartData: data, 
      finalCorpus: Math.max(0, corpus), 
      totalWithdrawals: Math.round(totalWithdrawn),
      scheduledTotalWithdrawals: Math.round(scheduledTotalWithdrawals),
      depletedAtYears: depletionPeriod ? (depletionPeriod / withdrawalsPerYear) : null
    };
    console.log('SWP calculation results:', results);
    setCalculationResults(results);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return value.toFixed(2) + '%';
  };

  // Removed handleCalculate in favor of inline calculation in Button click

  const toggleBreakdown = () => {
    setShowBreakdown(!showBreakdown);
  };

  const toggleComparison = () => {
    setShowComparison(!showComparison);
  };

  return (
    <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
      <FadeIn>
        <Typography variant="h4" component="h1" gutterBottom align="center" 
          sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}>
          <AnimatedText text="Systematic Withdrawal Plan (SWP) Calculator" />
        </Typography>
      </FadeIn>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Summary Cards */}
        <Box sx={{ order: { xs: 2, md: 1 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Box>
              <SlideIn direction="top" delay={0.1}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    bgcolor: 'rgba(20, 30, 50, 0.95)', 
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Final Corpus
                    </Typography>
                    <Typography variant="h5" color="#3B82F6" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={finalCorpus} 
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`finalCorpus-${formInputs._timestamp}`}
                      />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      After {withdrawalPeriod} years
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
            <Box>
              <SlideIn direction="top" delay={0.2}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    bgcolor: 'rgba(20, 30, 50, 0.95)', 
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Initial Investment
                    </Typography>
                    <Typography variant="h5" color="#E5E7EB" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={initialInvestment} 
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`initialInvestment-${formInputs._timestamp}`}
                      />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      One-time investment
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
            <Box>
              <SlideIn direction="top" delay={0.3}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    bgcolor: 'rgba(20, 30, 50, 0.95)', 
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Total Withdrawals
                    </Typography>
                    <Typography variant="h5" color="#10B981" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={scheduledTotalWithdrawals} 
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`scheduledTotalWithdrawals-${formInputs._timestamp}`}
                      />
                    </Typography>
                    <Typography variant="caption" color="#10B981">
                      {depletedAtYears && scheduledTotalWithdrawals !== totalWithdrawals
                        ? `Actual withdrawn ₹${new Intl.NumberFormat('en-IN').format(totalWithdrawals)} (depleted at year ${depletedAtYears.toFixed(1)})`
                        : `Over ${withdrawalPeriod} years`}
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
            <Box>
              <SlideIn direction="top" delay={0.4}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    bgcolor: 'rgba(20, 30, 50, 0.95)', 
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Monthly Withdrawal
                    </Typography>
                    <Typography variant="h5" color="#F59E0B" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={withdrawalAmount} 
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`withdrawalAmount-${formInputs._timestamp}`}
                      />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Withdrawal rate: {withdrawalRate.toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
          </Box>
        </Box>
      
        {/* Main Calculator Card */}
        <Card elevation={3} sx={{ 
          order: { xs: 1, md: 2 },
          bgcolor: 'rgba(20, 30, 50, 0.95)', 
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Systematic Withdrawal Plan Calculator
          </Typography>
          
          <Grid container spacing={3}>
            {/* Input Section */}
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Typography variant="h6" gutterBottom>
                Input Parameters
              </Typography>
              
              <Grid container spacing={2}>
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <TextField
                    id="swp-initial-investment"
                    name="initialInvestment"
                    label="Initial Investment"
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => handleInitialInvestmentChange(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputProps={{ 
                      inputProps: { min: 0 },
                      sx: { borderColor: 'rgba(255, 255, 255, 0.23)' }
                    }}
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Typography component="label" htmlFor="swp-withdrawal-rate" gutterBottom>
                    Withdrawal Rate: {formatPercentage(withdrawalRate)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleWithdrawalRateChange(Math.max(0, +(withdrawalRate - 1).toFixed(2)))}>-1%</Button>
                    <Slider
                      id="swp-withdrawal-rate"
                      name="withdrawalRate"
                      value={withdrawalRate}
                      onChange={(e, newValue) => handleWithdrawalRateChange(newValue)}
                      min={0}
                      max={20}
                      step={0.1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={formatPercentage}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button size="small" variant="outlined" onClick={() => handleWithdrawalRateChange(Math.min(100, +(withdrawalRate + 1).toFixed(2)))}>+1%</Button>
                    <TextField
                      size="small"
                      type="number"
                      value={withdrawalRate}
                      onChange={(e) => handleWithdrawalRateChange(Number(e.target.value))}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, inputProps: { step: 0.1 } }}
                      sx={{ width: 110 }}
                    />
                  </Box>
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <TextField
                    id="swp-withdrawal-amount"
                    name="withdrawalAmount"
                    label="Withdrawal Amount"
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => handleWithdrawalAmountChange(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputProps={{ 
                      inputProps: { min: 0 },
                      sx: { borderColor: 'rgba(255, 255, 255, 0.23)' }
                    }}
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Typography component="label" htmlFor="swp-expected-return" gutterBottom>
                    Expected Return: {formatPercentage(expectedReturn)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleInputChange('expectedReturn', Math.max(0, +(expectedReturn - 1).toFixed(2)))}>-1%</Button>
                    <Slider
                      id="swp-expected-return"
                      name="expectedReturn"
                      value={expectedReturn}
                      onChange={(e, newValue) => handleInputChange('expectedReturn', newValue)}
                      min={0}
                      max={30}
                      step={0.1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={formatPercentage}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button size="small" variant="outlined" onClick={() => handleInputChange('expectedReturn', Math.min(100, +(expectedReturn + 1).toFixed(2)))}>+1%</Button>
                    <TextField
                      size="small"
                      type="number"
                      value={expectedReturn}
                      onChange={(e) => handleInputChange('expectedReturn', Number(e.target.value))}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, inputProps: { step: 0.1 } }}
                      sx={{ width: 110 }}
                    />
                  </Box>
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Typography component="label" htmlFor="swp-withdrawal-period" gutterBottom>
                    Withdrawal Period: {withdrawalPeriod} years
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleInputChange('withdrawalPeriod', Math.max(1, withdrawalPeriod - 1))}>-1y</Button>
                    <Slider
                      id="swp-withdrawal-period"
                      name="withdrawalPeriod"
                      value={withdrawalPeriod}
                      onChange={(e, newValue) => handleInputChange('withdrawalPeriod', newValue)}
                      min={1}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ flexGrow: 1 }}
                    />
                    <Button size="small" variant="outlined" onClick={() => handleInputChange('withdrawalPeriod', Math.min(60, withdrawalPeriod + 1))}>+1y</Button>
                    <TextField
                      size="small"
                      type="number"
                      value={withdrawalPeriod}
                      onChange={(e) => handleInputChange('withdrawalPeriod', Math.max(1, Number(e.target.value)))}
                      InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment>, inputProps: { step: 1, min: 1 } }}
                      sx={{ width: 110 }}
                    />
                  </Box>
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Typography component="label" htmlFor="swp-inflation-rate" gutterBottom>
                    Inflation Rate: {formatPercentage(inflationRate)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleInputChange('inflationRate', Math.max(0, +(inflationRate - 1).toFixed(2)))}>-1%</Button>
                    <Slider
                      id="swp-inflation-rate"
                      name="inflationRate"
                      value={inflationRate}
                      onChange={(e, newValue) => handleInputChange('inflationRate', newValue)}
                      min={0}
                      max={15}
                      step={0.1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={formatPercentage}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button size="small" variant="outlined" onClick={() => handleInputChange('inflationRate', Math.min(100, +(inflationRate + 1).toFixed(2)))}>+1%</Button>
                    <TextField
                      size="small"
                      type="number"
                      value={inflationRate}
                      onChange={(e) => handleInputChange('inflationRate', Number(e.target.value))}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, inputProps: { step: 0.1, min: 0 } }}
                      sx={{ width: 110 }}
                    />
                  </Box>
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                      // Update the timestamp to force re-calculation
                      const updatedInputs = {...formInputs, _timestamp: Date.now()};
                      setFormInputs(updatedInputs);
                      calculateSWP(updatedInputs);
                      setShowDetails(true);
                      console.log('Calculating SWP with:', updatedInputs);
                    }}
                    fullWidth
                  >
                    Calculate
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Results Section */}
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Typography variant="h6" gutterBottom>
                SWP Results
              </Typography>
              
              {showDetails ? (
                <SlideIn direction="right">
                  <Box>
                    <Grid container spacing={2}>
                      <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Final Corpus
                            </Typography>
                            <Typography variant="h6">
                              <AnimatedCounter 
                                value={finalCorpus} 
                                prefix="₹" 
                                key={`finalCorpus-detail-${formInputs._timestamp}`}
                              />
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Total Withdrawals
                            </Typography>
                            <Typography variant="h6">
                              <AnimatedCounter 
                                value={totalWithdrawals} 
                                prefix="₹" 
                                key={`totalWithdrawals-detail-${formInputs._timestamp}`}
                              />
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                    
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        Corpus Projection
                      </Typography>
                      <ProjectionChartLW data={chartData} title="Corpus Projection" currency="INR" precision={0} />
                    </Box>
                    
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        SWP Summary
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart key={`pie-${formInputs._timestamp}`}>
                          <Pie
                            data={[
                              { name: 'Total Withdrawals', value: totalWithdrawals },
                              { name: 'Final Corpus', value: finalCorpus }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell key="cell-0" fill="#0088FE" />
                            <Cell key="cell-1" fill="#00C49F" />
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        {finalCorpus > 0 
                          ? "Your investment will last the entire withdrawal period" 
                          : "Your investment will be depleted before the end of your withdrawal period"}
                      </Typography>
                      
                      <Box mt={2} display="flex" justifyContent="space-between">
                        <Button 
                          variant="outlined" 
                          color="primary"
                          onClick={() => setShowDetails(false)}
                        >
                          Hide Details
                        </Button>
                        
                        <Box>
                          <Button 
                            variant="outlined" 
                            color="secondary"
                            onClick={toggleBreakdown}
                            sx={{ mr: 1 }}
                          >
                            {showBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
                          </Button>
                          
                          <Button 
                            variant="outlined" 
                            color="info"
                            onClick={toggleComparison}
                          >
                            {showComparison ? 'Hide Comparison' : 'Compare Scenarios'}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </SlideIn>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Click Calculate to see your SWP results.
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
        
        {/* SWP Breakdown Section */}
        {showBreakdown && (
          <CardContent>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              SWP Breakdown Analysis
            </Typography>
            
            <Box>
              <SWPBreakdown 
                customScenarios={{
                  current: {
                    name: 'Current Plan',
                    return: formInputs.expectedReturn,
                    years: formInputs.withdrawalPeriod,
                    monthlyWithdrawal: formInputs.withdrawalAmount,
                    principal: formInputs.initialInvestment
                  },
                  conservative: {
                    name: 'Conservative',
                    return: formInputs.expectedReturn * 0.8,
                    years: formInputs.withdrawalPeriod,
                    monthlyWithdrawal: formInputs.withdrawalAmount,
                    principal: formInputs.initialInvestment
                  },
                  aggressive: {
                    name: 'Aggressive',
                    return: formInputs.expectedReturn * 1.2,
                    years: formInputs.withdrawalPeriod,
                    monthlyWithdrawal: formInputs.withdrawalAmount,
                    principal: formInputs.initialInvestment
                  }
                }}
                selectedScenario="current"
              />
            </Box>
          </CardContent>
        )}
        
        {/* Scenario Comparison Section */}
        {showComparison && (
          <CardContent>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <ScenarioComparison 
                defaultAmount={formInputs.withdrawalAmount}
                defaultDuration={formInputs.withdrawalPeriod}
                selectedScenario="moderate"
                calculatorType="swp"
                initialPrincipal={formInputs.initialInvestment}
                onScenarioChange={(scenario, returnRate) => {
                  // Update the calculator based on scenario changes
                  handleInputChange('expectedReturn', returnRate);
                }}
              />
            </Box>
          </CardContent>
        )}
      </Card>
      </Box>
    </Box>
  );
};

export default SWPCalculator;