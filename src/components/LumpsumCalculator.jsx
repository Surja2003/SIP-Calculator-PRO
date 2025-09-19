import { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  TextField, 
  Typography, 
  Box, 
  Grid,
  InputAdornment,
  Button,
  CardContent,
  useTheme,
  LinearProgress,
  Switch,
  FormControlLabel,
  FormGroup
} from '@mui/material';
// Removed Recharts projection for lightweight-charts
import Range from './Range';
import { 
  FadeIn, 
  SlideIn, 
  AnimatedChart,
  AnimatedProgressBar,
  CountUp,
  AnimatedText
} from './animations';
import ProjectionChartLW from './ProjectionChartLW';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScenarioComparison from './ScenarioComparison';
import InvestmentBreakdown from './InvestmentBreakdown';

const LumpsumCalculator = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    amount: 100000,
    years: 5,
    annualRate: 12,
    includeInflation: false,
    inflation: 6,
    _timestamp: Date.now() // Add timestamp to force re-renders
  });
  
  // State to track selected scenario and sync between components
  const [selectedScenario, setSelectedScenario] = useState({
    name: 'moderate', // Must be one of: 'conservative', 'moderate', 'aggressive'
    returnRate: 12
  });

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      amount: value ? parseInt(value, 10) : 0,
      _timestamp: Date.now() // Add timestamp to force re-renders
    }));
  };

  const handleRangeChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      _timestamp: Date.now() // Add timestamp to force re-renders
    }));
  };

  const handleToggleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
      _timestamp: Date.now() // Add timestamp to force re-renders
    }));
  };
  
  // This useEffect has been replaced by the one below
  
  // Function to handle Calculate Returns button click
  const handleCalculateClick = () => {
    // Force re-calculation
    const updatedFormData = {...formData};
    
    // Add a timestamp to force a re-render and recalculation
    updatedFormData._timestamp = Date.now();
    
    // Update form data to trigger re-render
    setFormData(updatedFormData);
    
    console.log('Calculating lumpsum returns with:', updatedFormData);
    
    // Also force a re-calculation of scenario comparison by updating the selectedScenario
    setSelectedScenario(prev => ({
      ...prev,
      _timestamp: Date.now() // Add a timestamp to force re-render
    }));
    
    // Scroll to results section
    setTimeout(() => {
      window.scrollTo({
        top: 300,
        behavior: 'smooth'
      });
    }, 100);
  };

  // Use effect to perform initial calculation when component mounts
  useEffect(() => {
    console.log('Lumpsum Calculator - Initial calculation on mount');
    
    // Calculate Lumpsum values directly here to ensure we have initial values
    const amount = Number(formData.amount) || 100000;
    const years = Number(formData.years) || 5;
    const annualRate = Number(formData.annualRate) || 12;
  const rate = annualRate / 100;
  // Monthly compounding for initial calculation to align app-wide convention
  const monthlyRate = rate / 12;
  const futureValue = amount * Math.pow(1 + monthlyRate, years * 12);
    
    console.log('Initial calculation results:', {
      futureValue: Math.round(futureValue),
      initialInvestment: amount,
      gain: Math.round(futureValue - amount)
    });
    
    // Simulate a click on the calculate button to ensure all components initialize properly
    setTimeout(() => {
      // Force initial calculation by updating the timestamp
      setFormData(prevData => ({
        ...prevData,
        _timestamp: Date.now()
      }));
      
      // Also force a re-calculation of scenario comparison by updating the selectedScenario
      setSelectedScenario(prev => ({
        ...prev,
        _timestamp: Date.now() // Add a timestamp to force re-render
      }));
    }, 100);
    
    console.log('Calculating lumpsum returns with:', formData);
  }, []);

  const chartData = useMemo(() => {
    const data = [];
    const amount = Number(formData.amount) || 0;
    const rate = (Number(formData.annualRate) || 0) / 100;
    const inflation = formData.includeInflation ? (Number(formData.inflation) || 0) / 100 : 0;
    const annualEffective = formData.includeInflation ? ((1 + rate) / (1 + inflation) - 1) : rate;
    const monthlyRate = annualEffective / 12;

    let investedAmount = amount;
    let currentValue = amount;

    for (let year = 0; year <= (Number(formData.years) || 0); year++) {
      if (year === 0) {
        data.push({
          year: `Year ${year}`,
          Invested: investedAmount,
          'Current Value': currentValue,
        });
        continue;
      }

      // Apply monthly compounding for the year
      currentValue = currentValue * Math.pow(1 + monthlyRate, 12);

      data.push({
        year: `Year ${year}`,
        Invested: investedAmount,
        'Current Value': Math.round(currentValue),
      });
    }

    return data;
  }, [formData]);

  // Ensure we have valid numbers for all calculations
  // Direct calculation of lumpsum value as fallback if chart data is empty
  const amount = Number(formData.amount) || 100000;
  const years = Number(formData.years) || 5;
  const annualRate = Number(formData.annualRate) || 12;
  const rate = annualRate / 100;
  
  // Monthly compounding for summary and fallback
  const monthlyRate = (formData.includeInflation ? ((1 + rate) / (1 + (formData.inflation || 0) / 100) - 1) : rate) / 12;
  const directFutureValue = amount * Math.pow(1 + monthlyRate, years * 12);
  
  // Use chart data if available, otherwise use direct calculation
  const expectedAmount = !isNaN(chartData[chartData.length - 1]?.['Current Value']) ? 
                        chartData[chartData.length - 1]?.['Current Value'] : Math.round(directFutureValue);
  const investedAmount = !isNaN(Number(formData.amount)) ? Number(formData.amount) : amount;
  const gain = Math.max(0, expectedAmount - investedAmount);
  
  // Format numbers with commas
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
      <FadeIn>
        <Typography variant="h4" component="h1" gutterBottom align="center" 
          sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}>
          <AnimatedText text="Lumpsum Calculator" />
        </Typography>
      </FadeIn>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Summary Cards */}
        <Box sx={{ order: { xs: 2, md: 1 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Box>
              <SlideIn direction="top" delay={0.05}>
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
                      Maturity Amount
                    </Typography>
                    <Typography variant="h5" color="#3B82F6" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={isNaN(expectedAmount) ? 0 : expectedAmount} 
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        duration={0.6}
                      />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Expected return: {formData.annualRate}% p.a.
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
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
                      Initial Investment
                    </Typography>
                    <Typography variant="h5" color="#E5E7EB" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={isNaN(investedAmount) ? 0 : investedAmount} 
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        duration={0.6}
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
              <SlideIn direction="top" delay={0.15}>
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
                      Total Gains
                    </Typography>
                    <Typography variant="h5" color="#10B981" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={isNaN(gain) ? 0 : gain} 
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        duration={0.6}
                      />
                    </Typography>
                    <Typography variant="caption" color="#10B981">
                      +{investedAmount > 0 ? ((gain / investedAmount) * 100).toFixed(2) : '0.00'}% returns
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
            <Box>
              <SlideIn direction="top" delay={0.15}>
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
                      Investment Duration
                    </Typography>
                    <Typography variant="h5" color="#E5E7EB" sx={{ fontWeight: 'bold', my: 1 }}>
                      <CountUp 
                        to={isNaN(Number(formData.years)) ? 0 : Number(formData.years)}
                        duration={0.4}
                      /> Years
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Time horizon
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
          </Box>
        </Box>

  {/* Calculator and Chart */}
  <Box sx={{ order: { xs: 1, md: 2 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr', lg: '4fr 8fr' }, gap: 3 }}>
            {/* Calculator Inputs */}
            <Box>
              <FadeIn delay={0.1}>
                <Card 
                  elevation={3}
                  sx={{ 
                    bgcolor: 'rgba(20, 30, 50, 0.95)', 
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' 
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Lumpsum Calculator
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box>
                        <Typography variant="body2" component="label" htmlFor="lumpsum-initial-investment" sx={{ mb: 1 }}>Initial Investment</Typography>
                        <TextField
                          id="lumpsum-initial-investment"
                          name="lumpsum-initial-investment"
                          value={formData.amount}
                          onChange={handleAmountChange}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(30, 41, 59, 0.8)',
                              borderRadius: 1.5,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          }}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" component="label" htmlFor="lumpsum-investment-duration">Investment Duration</Typography>
                          <Box sx={{ 
                            bgcolor: 'rgba(30, 41, 59, 0.5)',
                            px: 2, 
                            py: 0.5, 
                            borderRadius: 1, 
                            display: 'inline-block' 
                          }}>
                            <Typography variant="body2" fontWeight="medium">{formData.years} Years</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Button size="small" variant="outlined" onClick={() => handleRangeChange('years')(Math.max(1, formData.years - 1))}>-1y</Button>
                          <Range
                            id="lumpsum-investment-duration"
                            value={formData.years}
                            min={1}
                            max={30}
                            onChange={handleRangeChange('years')}
                          />
                          <Button size="small" variant="outlined" onClick={() => handleRangeChange('years')(Math.min(60, formData.years + 1))}>+1y</Button>
                          <TextField size="small" type="number" value={formData.years}
                            onChange={(e) => handleRangeChange('years')(Math.max(1, Number(e.target.value)))}
                            InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment>, inputProps: { min: 1, step: 1 } }}
                            sx={{ width: 110 }}
                          />
                        </Box>
                        <AnimatedProgressBar 
                          value={formData.years} 
                          max={30} 
                          duration={0.5}
                          height={4}
                          foregroundColor={theme.palette.primary.main}
                        />
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" component="label" htmlFor="lumpsum-annual-return">Expected Annual Return</Typography>
                          <Box sx={{ 
                            bgcolor: 'rgba(30, 41, 59, 0.5)',
                            px: 2, 
                            py: 0.5, 
                            borderRadius: 1, 
                            display: 'inline-block' 
                          }}>
                            <Typography variant="body2" fontWeight="medium">{formData.annualRate}%</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Button size="small" variant="outlined" onClick={() => handleRangeChange('annualRate')(Math.max(0, +(formData.annualRate - 1).toFixed(2)))}>-1%</Button>
                          <Range
                            id="lumpsum-annual-return"
                            name="annualRate"
                            value={formData.annualRate}
                            min={0}
                            max={30}
                            onChange={handleRangeChange('annualRate')}
                          />
                          <Button size="small" variant="outlined" onClick={() => handleRangeChange('annualRate')(Math.min(100, +(formData.annualRate + 1).toFixed(2)))}>+1%</Button>
                          <TextField size="small" type="number" value={formData.annualRate}
                            onChange={(e) => handleRangeChange('annualRate')(Number(e.target.value))}
                            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, inputProps: { step: 0.1 } }}
                            sx={{ width: 110 }}
                          />
                        </Box>
                        <AnimatedProgressBar 
                          value={formData.annualRate} 
                          max={30} 
                          duration={0.5}
                          height={4}
                          foregroundColor={theme.palette.success.main}
                        />
                      </Box>

                      {/* Inflation Toggle */}
                      <Box>
                        <FormGroup>
                          <FormControlLabel 
                            control={
                              <Switch 
                                checked={formData.includeInflation}
                                onChange={handleToggleChange('includeInflation')}
                                color="primary"
                                id="lumpsum-include-inflation"
                                name="includeInflation"
                              />
                            } 
                            label={
                              <Typography variant="body2" component="span">
                                Include Inflation
                              </Typography>
                            }
                            htmlFor="lumpsum-include-inflation"
                          />
                        </FormGroup>
                        
                        {formData.includeInflation && (
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" component="label" htmlFor="lumpsum-inflation-rate">Inflation Rate</Typography>
                              <Box sx={{ 
                                bgcolor: 'rgba(30, 41, 59, 0.5)',
                                px: 2, 
                                py: 0.5, 
                                borderRadius: 1, 
                                display: 'inline-block' 
                              }}>
                                <Typography variant="body2" fontWeight="medium">{formData.inflation}%</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Button size="small" variant="outlined" onClick={() => handleRangeChange('inflation')(Math.max(0, +(formData.inflation - 1).toFixed(2)))}>-1%</Button>
                              <Range
                                id="lumpsum-inflation-rate"
                                name="inflation"
                                value={formData.inflation}
                                min={0}
                                max={15}
                                onChange={handleRangeChange('inflation')}
                              />
                              <Button size="small" variant="outlined" onClick={() => handleRangeChange('inflation')(Math.min(100, +(formData.inflation + 1).toFixed(2)))}>+1%</Button>
                              <TextField size="small" type="number" value={formData.inflation}
                                onChange={(e) => handleRangeChange('inflation')(Number(e.target.value))}
                                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, inputProps: { step: 0.1, min: 0 } }}
                                sx={{ width: 110 }}
                              />
                            </Box>
                            <AnimatedProgressBar 
                              value={formData.inflation} 
                              max={15} 
                              duration={0.5}
                              height={4}
                              foregroundColor={theme.palette.warning.main}
                            />
                          </Box>
                        )}
                      </Box>
                      
                      {/* Calculate Button */}
                      <Button 
                        variant="contained"
                        fullWidth
                        onClick={handleCalculateClick}
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: 2,
                          bgcolor: '#3B82F6',
                          '&:hover': {
                            bgcolor: '#2563EB',
                          },
                          boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                        }}
                      >
                        Calculate Returns
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </FadeIn>
            </Box>

            {/* Chart */}
            <Box>
              <AnimatedChart delay={0.2}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" fontWeight="500">
                      Investment Growth Projection
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      '& .legend-item': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }
                    }}>
                      <Box className="legend-item">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                        <Typography variant="caption">Principal</Typography>
                      </Box>
                      <Box className="legend-item">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                        <Typography variant="caption">Growth</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                    <Box sx={{ height: 450, width: '100%', flexGrow: 1, pt: 2 }}>
                      <ProjectionChartLW data={chartData} title="Investment Growth Projection" currency="INR" precision={0} />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 3,
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      bgcolor: 'background.paper'
                    }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Investment Duration
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formData.years} Years
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Initial Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formatCurrency(formData.amount)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Expected Return
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formData.annualRate}% p.a.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Maturity Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="500" color="primary.main">
                          {formatCurrency(expectedAmount)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </AnimatedChart>
            </Box>
          </Box>
        </Box>

        {/* Scenario Comparison Section */}
        <Box sx={{ mt: 6 }}>
          <FadeIn delay={0.3}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ mr: 1 }} />
                Lumpsum Scenarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compare how your one-time investment would perform under different market conditions.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
              <Box>
                <ScenarioComparison
                  defaultAmount={formData.amount}
                  defaultDuration={formData.years}
                  selectedScenario={selectedScenario.name}
                  calculatorType="lumpsum"
                  onScenarioChange={(scenario, returnRate) => {
                    setSelectedScenario({
                      name: scenario,
                      returnRate: returnRate
                    });
                  }}
                />
              </Box>
              
              <Box>
                <FadeIn delay={0.4}>
                  <Card sx={{ 
                    p: 0, 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                    height: '100%'
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <AccessTimeIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="500">
                        Investment vs Returns Breakdown
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <InvestmentBreakdown 
                        selectedScenario={selectedScenario.name}
                        calculatorType="lumpsum"
                        customScenarios={{
                          moderate: {
                            name: 'Your Investment',
                            return: selectedScenario.name === 'moderate' ? selectedScenario.returnRate || formData.annualRate : 12,
                            years: formData.years,
                            monthlyAmount: formData.amount
                          },
                          conservative: {
                            name: 'Conservative',
                            return: 8,
                            years: formData.years,
                            monthlyAmount: formData.amount
                          },
                          aggressive: {
                            name: 'Aggressive',
                            return: 15,
                            years: formData.years,
                            monthlyAmount: formData.amount
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </FadeIn>
              </Box>
            </Box>
          </FadeIn>
        </Box>
      </Box>
    </Box>
  );
};

export default LumpsumCalculator;