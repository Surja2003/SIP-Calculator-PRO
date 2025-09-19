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
  LinearProgress
} from '@mui/material';
// Removed Recharts for projection; using LightweightCharts wrapper
import Range from './Range';
import { 
  FadeIn, 
  SlideIn, 
  AnimatedProgressBar,
  CountUp,
  AnimatedText,
  AnimatedChart
} from './animations';
import ProjectionChartLW from './ProjectionChartLW';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScenarioComparison from './ScenarioComparison';
import InvestmentBreakdown from './InvestmentBreakdown';


// SIP calculator component

const SIPCalculator = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    amount: 5000,
    years: 5,
    annualRate: 12,
    includeInflation: false,
    inflation: 6,
    isStepUpSIP: false,
    stepUpPercentage: 10,
    stepUpFrequency: 12, // 6 or 12 months
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

  const handleInflationToggle = () => {
    setFormData(prev => ({
      ...prev,
      includeInflation: !prev.includeInflation,
      _timestamp: Date.now() // Add timestamp to force re-renders
    }));
  };

  const handleStepUpToggle = () => {
    setFormData(prev => ({
      ...prev,
      isStepUpSIP: !prev.isStepUpSIP,
      _timestamp: Date.now() // Add timestamp to force re-renders
    }));
  };

  const handleStepUpFrequencyChange = (frequency) => {
    setFormData(prev => ({
      ...prev,
      stepUpFrequency: frequency,
      _timestamp: Date.now() // Add timestamp to force re-renders
    }));
  };
  
  // Use effect to perform initial calculation when component mounts
  useEffect(() => {
    console.log('SIP Calculator - Initial calculation on mount');
    
    // Force immediate calculation with default values
    const initialCalculation = () => {
      // Calculate SIP values directly here to ensure we have initial values
      const amount = Number(formData.amount) || 5000;
      const years = Number(formData.years) || 5;
      const annualRate = Number(formData.annualRate) || 12;
      const monthlyRate = annualRate / (12 * 100);
      
      // Basic SIP calculation formula
      const months = years * 12;
      const futureValue = amount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      const totalInvestment = amount * months;
      
      console.log('Initial calculation results:', {
        futureValue: Math.round(futureValue),
        totalInvestment: Math.round(totalInvestment),
        gain: Math.round(futureValue - totalInvestment)
      });
    };
    
    // Run initial calculation
    initialCalculation();
    
    // Force re-render by updating timestamp
    setFormData(prevData => ({
      ...prevData,
      _timestamp: Date.now()
    }));
    
    console.log('Calculating returns with:', formData);
  }, []);
  
  // Function to handle Calculate Returns button click
  const handleCalculateClick = () => {
    // Force re-calculation
    const updatedFormData = {...formData};
    
    // Add a timestamp to force a re-render and recalculation
    updatedFormData._timestamp = Date.now();
    
    // Update form data to trigger re-render
    setFormData(updatedFormData);
    
    console.log('Calculating returns with:', updatedFormData);
    console.log('Expected maturity amount:', expectedAmount);
    
    // Scroll to results section
    setTimeout(() => {
      window.scrollTo({
        top: 300,
        behavior: 'smooth'
      });
    }, 100);
  };

  const chartData = useMemo(() => {
    const data = [];
    let baseMonthlyAmount = Number(formData.amount) || 0;
    const rate = (Number(formData.annualRate) || 0) / 100;
    const monthlyRate = rate / 12;
    const inflation = formData.includeInflation ? (Number(formData.inflation) || 0) / 100 : 0;
    const realRate = (1 + rate) / (1 + inflation) - 1;
    const realMonthlyRate = realRate / 12;
    const stepUpRate = formData.isStepUpSIP ? (Number(formData.stepUpPercentage) || 0) / 100 : 0;
    const stepUpFrequency = Number(formData.stepUpFrequency) || 12; // 6 or 12 months

    let investedAmount = 0;
    let currentValue = 0;
    let monthlyAmount = baseMonthlyAmount;

    for (let year = 0; year <= (Number(formData.years) || 0); year++) {
      if (year === 0) {
        data.push({
          year: `Year ${year}`,
          Invested: investedAmount,
          'Current Value': currentValue,
          Returns: 0
        });
        continue;
      }

      // Calculate monthly investment with step-up
      let yearlyInvestment = 0;
      let prevMonthValue = currentValue;
      
      for (let month = 1; month <= 12; month++) {
        // Apply step-up if needed
        if (formData.isStepUpSIP && 
            ((stepUpFrequency === 6 && month % 6 === 1 && year > 0) || 
             (stepUpFrequency === 12 && month === 1 && year > 0))) {
          monthlyAmount = Math.round(monthlyAmount * (1 + stepUpRate));
        }
        
        yearlyInvestment += monthlyAmount;
        
        // Calculate growth for this month
        let monthlyGrowth = formData.includeInflation ? realMonthlyRate : monthlyRate;
        prevMonthValue = (prevMonthValue + monthlyAmount) * (1 + monthlyGrowth);
      }
      
      investedAmount += yearlyInvestment;
      currentValue = prevMonthValue;

      data.push({
        year: `Year ${year}`,
        Invested: Math.round(investedAmount),
        'Current Value': Math.round(currentValue),
        Returns: Math.round(currentValue - investedAmount)
      });
    }

    return data;
  }, [formData]);

  // Ensure we have valid numbers for all calculations
  const lastDataPoint = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  
  // Directly calculate values if chartData is empty - ensures we have non-zero values
  const amount = Number(formData.amount) || 5000;
  const years = Number(formData.years) || 5;
  const annualRate = Number(formData.annualRate) || 12;
  const monthlyRate = annualRate / (12 * 100);
  
  // Basic SIP calculation for immediate fallback values
  const months = years * 12;
  const directFutureValue = amount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  const directTotalInvestment = amount * months;
  
  // Calculate maturity amount (Current Value from last data point or direct calculation)
  const expectedAmount = lastDataPoint && !isNaN(lastDataPoint['Current Value']) ? 
                         lastDataPoint['Current Value'] : Math.round(directFutureValue);
  
  // Calculate total investment
  const investedAmount = lastDataPoint && !isNaN(lastDataPoint['Invested']) ?
                         lastDataPoint['Invested'] : 
                         Math.round(directTotalInvestment);
  
  // Calculate gain
  const gain = Math.max(0, expectedAmount - investedAmount);
  
  console.log('Calculation results:', { expectedAmount, investedAmount, gain });

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
          <AnimatedText text="SIP Calculator" />
        </Typography>
      </FadeIn>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
  {/* Summary Cards */}
  <Box sx={{ order: { xs: 2, md: 2 } }}>
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
                      Maturity Amount
                    </Typography>
                    <Typography variant="h5" color="#3B82F6" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={expectedAmount || 0} 
                        from={0}
                        duration={1.5}
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`maturity-${formData._timestamp || 'initial'}`}
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
                      Total Investment
                    </Typography>
                    <Typography variant="h5" color="#E5E7EB" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={investedAmount || 0} 
                        from={0}
                        duration={1.5}
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`invested-${formData._timestamp || 'initial'}`}
                      />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Over {formData.years} years
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
                      Total Gains
                    </Typography>
                    <Typography variant="h5" color="#10B981" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={gain || 0} 
                        from={0}
                        duration={1.5}
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`gain-${formData._timestamp || 'initial'}`}
                      />
                    </Typography>
                    <Typography variant="caption" color="#10B981">
                      +{investedAmount > 0 ? ((gain / investedAmount) * 100).toFixed(2) : '0.00'}% growth
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
                      Monthly SIP
                    </Typography>
                    <Typography variant="h5" color="#E5E7EB" sx={{ fontWeight: 'bold', my: 1 }}>
                      ₹<CountUp 
                        to={Number(formData.amount) || 0} 
                        from={0}
                        duration={1.5}
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(Math.round(value))}
                        key={`monthly-${formData._timestamp || 'initial'}`}
                      />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Current investment
                    </Typography>
                  </CardContent>
                </Card>
              </SlideIn>
            </Box>
          </Box>
        </Box>

  {/* Calculator and Chart */}
  <Box sx={{ order: { xs: 1, md: 1 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr', lg: '4fr 8fr' }, gap: 3 }}>
            {/* Calculator Inputs */}
            <Box>
              <FadeIn delay={0.2}>
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
                        SIP Calculator
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box>
                        <Typography variant="body2" component="label" htmlFor="sip-monthly-investment" sx={{ mb: 1 }}>Monthly Investment</Typography>
                        <TextField
                          id="sip-monthly-investment"
                          name="sip-monthly-investment"
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
                          <Typography variant="body2" component="label" htmlFor="sip-investment-duration">Investment Duration</Typography>
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
                            id="sip-investment-duration"
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
                          <Typography variant="body2" component="label" htmlFor="sip-expected-return">Expected Annual Return</Typography>
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
                            id="sip-expected-return"
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
                      
                      {/* Step-up SIP Toggle */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" component="label" htmlFor="sip-step-up-toggle">
                          Step-up SIP
                        </Typography>
                        <Box sx={{ 
                          bgcolor: 'rgba(30, 41, 59, 0.3)',
                          borderRadius: 8,
                          p: 0.3,
                          width: 60,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: formData.isStepUpSIP ? 'flex-end' : 'flex-start',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        onClick={handleStepUpToggle}
                        id="sip-step-up-toggle"
                        role="switch"
                        aria-checked={formData.isStepUpSIP}
                        tabIndex={0}
                        >
                          <Box sx={{ 
                            bgcolor: formData.isStepUpSIP ? '#3B82F6' : 'rgba(255, 255, 255, 0.3)',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            mx: 0.5,
                            transition: 'all 0.3s ease'
                          }} />
                        </Box>
                      </Box>
                      
                      {/* Step-up SIP Options */}
                      {formData.isStepUpSIP && (
                        <FadeIn>
                          <Box sx={{ 
                            p: 2, 
                            mt: 1, 
                            bgcolor: 'rgba(30, 41, 59, 0.3)', 
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" component="label" htmlFor="sip-step-up-percentage">Annual Step-up Percentage</Typography>
                              <Box sx={{ 
                                bgcolor: 'rgba(59, 130, 246, 0.2)',
                                px: 2, 
                                py: 0.5, 
                                borderRadius: 1, 
                                display: 'inline-block' 
                              }}>
                                <Typography variant="body2" fontWeight="medium" color="primary">
                                  {formData.stepUpPercentage}%
                                </Typography>
                              </Box>
                            </Box>
                            <Range
                              id="sip-step-up-percentage"
                              value={formData.stepUpPercentage}
                              min={1}
                              max={25}
                              onChange={handleRangeChange('stepUpPercentage')}
                            />
                            <AnimatedProgressBar 
                              value={formData.stepUpPercentage} 
                              max={25} 
                              duration={0.5}
                              height={4}
                              foregroundColor="#3B82F6"
                            />
                            
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="body2" component="label" htmlFor="sip-step-up-frequency" mb={1}>Step-up Frequency</Typography>
                              <Box 
                                id="sip-step-up-frequency"
                                sx={{ 
                                display: 'flex', 
                                gap: 2,
                                '.MuiButton-root': {
                                  borderRadius: 1.5,
                                  py: 0.7,
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  fontSize: '0.875rem'
                                }
                              }}>
                                <Button
                                  variant={formData.stepUpFrequency === 6 ? "contained" : "outlined"}
                                  color="primary"
                                  fullWidth
                                  onClick={() => handleStepUpFrequencyChange(6)}
                                  aria-pressed={formData.stepUpFrequency === 6}
                                  role="radio"
                                  aria-checked={formData.stepUpFrequency === 6}
                                  sx={{
                                    bgcolor: formData.stepUpFrequency === 6 ? 'primary.main' : 'transparent',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    '&:hover': {
                                      bgcolor: formData.stepUpFrequency === 6 ? 'primary.dark' : 'rgba(59, 130, 246, 0.1)',
                                    }
                                  }}
                                >
                                  Every 6 Months
                                </Button>
                                <Button
                                  variant={formData.stepUpFrequency === 12 ? "contained" : "outlined"}
                                  color="primary"
                                  fullWidth
                                  onClick={() => handleStepUpFrequencyChange(12)}
                                  aria-pressed={formData.stepUpFrequency === 12}
                                  role="radio"
                                  aria-checked={formData.stepUpFrequency === 12}
                                  sx={{
                                    bgcolor: formData.stepUpFrequency === 12 ? 'primary.main' : 'transparent',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    '&:hover': {
                                      bgcolor: formData.stepUpFrequency === 12 ? 'primary.dark' : 'rgba(59, 130, 246, 0.1)',
                                    }
                                  }}
                                >
                                  Yearly
                                </Button>
                              </Box>
                            </Box>
                          </Box>
                        </FadeIn>
                      )}
                      
                      {/* Inflation Toggle */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" component="label" htmlFor="sip-inflation-toggle">
                          Include Inflation Impact
                        </Typography>
                        <Box sx={{ 
                          bgcolor: 'rgba(30, 41, 59, 0.3)',
                          borderRadius: 8,
                          p: 0.3,
                          width: 60,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: formData.includeInflation ? 'flex-end' : 'flex-start',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        onClick={handleInflationToggle}
                        id="sip-inflation-toggle"
                        role="switch"
                        aria-checked={formData.includeInflation}
                        tabIndex={0}
                        >
                          <Box sx={{ 
                            bgcolor: formData.includeInflation ? '#EF4444' : 'rgba(255, 255, 255, 0.3)',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            mx: 0.5,
                            transition: 'all 0.3s ease'
                          }} />
                        </Box>
                      </Box>
                      
                      {/* Inflation Options */}
                      {formData.includeInflation && (
                        <FadeIn>
                          <Box sx={{ 
                            p: 2, 
                            mt: 1, 
                            bgcolor: 'rgba(30, 41, 59, 0.3)', 
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" component="label" htmlFor="sip-inflation-rate">Expected Inflation Rate</Typography>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Button size="small" variant="outlined" onClick={() => handleRangeChange('inflation')(Math.max(0, +(formData.inflation - 1).toFixed(2)))}>-1%</Button>
                              <Range
                                id="sip-inflation-rate"
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
                              foregroundColor="#EF4444"
                            />
                          </Box>
                        </FadeIn>
                      )}
                      
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
              <AnimatedChart delay={0.4}>
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
                        <Typography variant="caption">Investment</Typography>
                      </Box>
                      <Box className="legend-item">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                        <Typography variant="caption">Returns</Typography>
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
                          Monthly SIP
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
  <Box sx={{ mt: 6, order: { xs: 3, md: 3 } }}>
          <FadeIn delay={0.3}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ mr: 1 }} />
                SIP Scenarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compare how your SIP investment would perform under different market conditions.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
              <Box>
                <ScenarioComparison
                  defaultAmount={formData.amount}
                  defaultDuration={formData.years}
                  selectedScenario={selectedScenario.name}
                  onScenarioChange={(scenario, returnRate) => {
                    setSelectedScenario({
                      name: scenario,
                      returnRate: returnRate
                    });
                  }}
                  includeInflation={formData.includeInflation}
                  inflationRate={formData.inflation}
                  isStepUpSIP={formData.isStepUpSIP}
                  stepUpPercentage={formData.stepUpPercentage}
                  stepUpFrequency={formData.stepUpFrequency}
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
                        customScenarios={{
                          moderate: {
                            name: 'Your SIP',
                            return: selectedScenario.name === 'moderate' ? selectedScenario.returnRate || formData.annualRate : 12,
                            years: formData.years,
                            monthlyAmount: formData.amount,
                            includeInflation: formData.includeInflation,
                            inflationRate: formData.inflation,
                            isStepUpSIP: formData.isStepUpSIP,
                            stepUpPercentage: formData.stepUpPercentage,
                            stepUpFrequency: formData.stepUpFrequency
                          },
                          conservative: {
                            name: 'Conservative',
                            return: 8,
                            years: formData.years,
                            monthlyAmount: formData.amount,
                            includeInflation: formData.includeInflation,
                            inflationRate: formData.inflation,
                            isStepUpSIP: formData.isStepUpSIP,
                            stepUpPercentage: formData.stepUpPercentage,
                            stepUpFrequency: formData.stepUpFrequency
                          },
                          aggressive: {
                            name: 'Aggressive',
                            return: 15,
                            years: formData.years,
                            monthlyAmount: formData.amount,
                            includeInflation: formData.includeInflation,
                            inflationRate: formData.inflation,
                            isStepUpSIP: formData.isStepUpSIP,
                            stepUpPercentage: formData.stepUpPercentage,
                            stepUpFrequency: formData.stepUpFrequency
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

        {/* End of main content */}
      </Box>
    </Box>
  );
};

export default SIPCalculator;