import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Range from './Range';
import { 
  FadeIn, 
  SlideIn, 
  AnimatedChart,
  AnimatedProgressBar,
  CountUp,
  AnimatedText
} from './animations';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScenarioComparison from './ScenarioComparison';
import InvestmentBreakdown from './InvestmentBreakdown';
import { 
  formatCurrency, 
  calculateLumpsumFutureValue,
  generateChartData,
  SCENARIOS
} from '../utils/calculatorUtils';

const LumpsumCalculator = () => {
  const theme = useTheme();
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Initialize form data with default values
  const [formData, setFormData] = useState({
    amount: 100000,
    years: 5,
    annualRate: 12,
    includeInflation: false,
    inflation: 6,
    timestamp: Date.now() // Add timestamp to force re-renders
  });
  
  // State to track selected scenario 
  const [selectedScenario, setSelectedScenario] = useState({
    name: 'moderate', // Must be one of: 'conservative', 'moderate', 'aggressive'
    returnRate: 12
  });

  // Handle input changes
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      amount: value ? parseInt(value, 10) : 0,
      timestamp: Date.now() // Update timestamp
    }));
  };

  const handleRangeChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      timestamp: Date.now() // Update timestamp
    }));
  };

  const handleToggleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
      timestamp: Date.now() // Update timestamp
    }));
  };
  
  // Function to handle Calculate Returns button click
  const handleCalculateClick = useCallback(() => {
    // Show loading state
    setIsCalculating(true);
    
    // Update timestamp to force re-render
    setFormData(prev => ({
      ...prev,
      timestamp: Date.now()
    }));
    
    // Also update selected scenario to force re-render
    setSelectedScenario(prev => ({
      ...prev,
      timestamp: Date.now()
    }));
    
    // Log calculation
    console.log('Calculating lumpsum returns with:', formData);
    
    // Scroll to results section and hide loading state after a short delay
    setTimeout(() => {
      window.scrollTo({
        top: 300,
        behavior: 'smooth'
      });
      setIsCalculating(false);
    }, 600);
  }, [formData]);

  // Initial calculation effect
  useEffect(() => {
    // Trigger calculation when component mounts
    console.log('Lumpsum Calculator - Initial calculation on mount');
    
    // Simulate a click on the calculate button
    setTimeout(() => {
      handleCalculateClick();
    }, 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate chart data
  const chartData = useMemo(() => {
    return generateChartData(
      'lumpsum',
      formData.amount,
      formData.annualRate,
      formData.years,
      formData.includeInflation,
      formData.inflation
    );
  }, [
    formData.amount,
    formData.annualRate,
    formData.years,
    formData.includeInflation,
    formData.inflation,
    formData.timestamp
  ]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const futureValue = calculateLumpsumFutureValue(
      formData.amount,
      formData.annualRate,
      formData.years,
      formData.includeInflation,
      formData.inflation
    );
    
    const investedAmount = Number(formData.amount) || 0;
    const gains = Math.max(0, futureValue - investedAmount);
    const returnPercentage = investedAmount > 0 ? ((gains / investedAmount) * 100) : 0;
    
    return {
      futureValue,
      investedAmount,
      gains,
      returnPercentage
    };
  }, [
    formData.amount,
    formData.annualRate,
    formData.years,
    formData.includeInflation,
    formData.inflation,
    formData.timestamp
  ]);

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
        <Box>
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
                      <CountUp 
                        to={metrics.futureValue} 
                        formatter={(value) => formatCurrency(value)}
                        key={`maturity-${formData.timestamp}`}
                        duration={1}
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
                      <CountUp 
                        to={metrics.investedAmount} 
                        formatter={(value) => formatCurrency(value)}
                        key={`invested-${formData.timestamp}`}
                        duration={1}
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
                      <CountUp 
                        to={metrics.gains} 
                        formatter={(value) => formatCurrency(value)}
                        key={`gain-${formData.timestamp}`}
                        duration={1}
                      />
                    </Typography>
                    <Typography variant="caption" color="#10B981">
                      +{metrics.returnPercentage.toFixed(2)}% returns
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
                        to={formData.years} 
                        key={`years-${formData.timestamp}`}
                        duration={1}
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
        <Box>
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
                        <Range
                          id="lumpsum-investment-duration"
                          value={formData.years}
                          min={1}
                          max={30}
                          onChange={handleRangeChange('years')}
                        />
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
                        <Range
                          id="lumpsum-annual-return"
                          name="annualRate"
                          value={formData.annualRate}
                          min={1}
                          max={30}
                          onChange={handleRangeChange('annualRate')}
                        />
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
                            <Range
                              id="lumpsum-inflation-rate"
                              name="inflation"
                              value={formData.inflation}
                              min={1}
                              max={15}
                              onChange={handleRangeChange('inflation')}
                            />
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
                        disabled={isCalculating}
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
                        {isCalculating ? 'Calculating...' : 'Calculate Returns'}
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
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={chartData} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid 
                            vertical={false} 
                            strokeDasharray="3 3" 
                            stroke="rgba(255,255,255,0.1)" 
                          />
                          <XAxis 
                            dataKey="year" 
                            axisLine={{ stroke: theme.palette.divider }} 
                            tickLine={{ stroke: theme.palette.divider }}
                            dy={10}
                            allowDataOverflow={false}
                          />
                          <YAxis 
                            tickFormatter={(value) => {
                              if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
                              if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                              if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                              return `₹${value}`;
                            }}
                            axisLine={{ stroke: theme.palette.divider }}
                            tickLine={{ stroke: theme.palette.divider }}
                            dx={-10}
                          />
                          <Tooltip 
                            formatter={(value, name) => {
                              return [formatCurrency(value), name === 'Invested' ? 'Principal Amount' : 'Current Value'];
                            }}
                            labelFormatter={(value) => `${value}`}
                            contentStyle={{ 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Invested"
                            stackId="1"
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                            fill="url(#colorInvested)"
                            fillOpacity={1}
                            activeDot={{ 
                              r: 6, 
                              strokeWidth: 1, 
                              stroke: theme.palette.background.paper,
                              fill: theme.palette.primary.main
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Current Value"
                            stroke={theme.palette.success.main}
                            strokeWidth={2}
                            fill="url(#colorReturns)"
                            fillOpacity={1}
                            activeDot={{ 
                              r: 6, 
                              strokeWidth: 1, 
                              stroke: theme.palette.background.paper,
                              fill: theme.palette.success.main
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
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
                          {formatCurrency(metrics.futureValue)}
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
                      returnRate: returnRate,
                      timestamp: Date.now()
                    });
                  }}
                  key={`scenario-${formData.timestamp}`}
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
                        key={`breakdown-${formData.timestamp}`}
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