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
import { 
  formatCurrency, 
  calculateSWPFutureValue,
  generateSWPChartData
} from '../utils/calculatorUtils';

const SWPCalculator = () => {
  const theme = useTheme();
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Initialize form data with default values
  const [formData, setFormData] = useState({
    initialAmount: 5000000,
    monthlyWithdrawal: 30000,
    years: 20,
    annualRate: 10,
    includeInflation: false,
    inflation: 6,
    withdrawalGrowth: 0,
    timestamp: Date.now() // Add timestamp to force re-renders
  });

  // Handle input changes
  const handleInitialAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      initialAmount: value ? parseInt(value, 10) : 0,
      timestamp: Date.now() // Update timestamp
    }));
  };

  const handleWithdrawalAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      monthlyWithdrawal: value ? parseInt(value, 10) : 0,
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
    
    // Log calculation
    console.log('Calculating SWP details with:', formData);
    
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
    console.log('SWP Calculator - Initial calculation on mount');
    
    // Simulate a click on the calculate button
    setTimeout(() => {
      handleCalculateClick();
    }, 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate chart data
  const chartData = useMemo(() => {
    return generateSWPChartData(
      formData.initialAmount,
      formData.monthlyWithdrawal,
      formData.annualRate,
      formData.years,
      formData.includeInflation,
      formData.inflation,
      formData.withdrawalGrowth
    );
  }, [
    formData.initialAmount,
    formData.monthlyWithdrawal,
    formData.annualRate,
    formData.years,
    formData.includeInflation,
    formData.inflation,
    formData.withdrawalGrowth,
    formData.timestamp
  ]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const result = calculateSWPFutureValue(
      formData.initialAmount,
      formData.monthlyWithdrawal,
      formData.annualRate,
      formData.years,
      formData.includeInflation,
      formData.inflation,
      formData.withdrawalGrowth
    );
    
    const totalMonths = formData.years * 12;
    
    // Calculate total withdrawal amount considering growth
    let totalWithdrawalAmount = 0;
    let monthlyWithdrawal = formData.monthlyWithdrawal;
    
    for (let year = 0; year < formData.years; year++) {
      for (let month = 0; month < 12; month++) {
        // Add this month's withdrawal to the total
        totalWithdrawalAmount += monthlyWithdrawal;
      }
      
      // Apply annual growth to monthly withdrawal if applicable
      if (formData.withdrawalGrowth > 0) {
        monthlyWithdrawal = monthlyWithdrawal * (1 + formData.withdrawalGrowth / 100);
      }
    }
    
    return {
      finalCorpus: result.finalCorpus,
      initialAmount: formData.initialAmount,
      totalWithdrawalAmount,
      corpusChangePercent: ((result.finalCorpus - formData.initialAmount) / formData.initialAmount) * 100,
      lastWithdrawalAmount: result.lastWithdrawalAmount,
      corpusSustainable: result.corpusSustainable
    };
  }, [
    formData.initialAmount,
    formData.monthlyWithdrawal,
    formData.annualRate,
    formData.years,
    formData.includeInflation,
    formData.inflation,
    formData.withdrawalGrowth,
    formData.timestamp
  ]);

  return (
    <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
      <FadeIn>
        <Typography variant="h4" component="h1" gutterBottom align="center" 
          sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}>
          <AnimatedText text="SWP Calculator" />
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
                      Final Corpus
                    </Typography>
                    <Typography variant="h5" color={metrics.finalCorpus > 0 ? "#3B82F6" : "#EF4444"} sx={{ fontWeight: 'bold', my: 1 }}>
                      <CountUp 
                        to={metrics.finalCorpus} 
                        formatter={(value) => formatCurrency(value)}
                        key={`final-corpus-${formData.timestamp}`}
                        duration={1}
                      />
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: metrics.corpusChangePercent >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                      }}
                    >
                      {metrics.corpusChangePercent >= 0 ? '+' : ''}{metrics.corpusChangePercent.toFixed(2)}% from initial
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
                        to={formData.initialAmount} 
                        formatter={(value) => formatCurrency(value)}
                        key={`initial-${formData.timestamp}`}
                        duration={1}
                      />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Lumpsum investment
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
                      Total Withdrawals
                    </Typography>
                    <Typography variant="h5" color="#10B981" sx={{ fontWeight: 'bold', my: 1 }}>
                      <CountUp 
                        to={metrics.totalWithdrawalAmount} 
                        formatter={(value) => formatCurrency(value)}
                        key={`total-withdrawal-${formData.timestamp}`}
                        duration={1}
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
                      Final Monthly Withdrawal
                    </Typography>
                    <Typography variant="h5" color="#E5E7EB" sx={{ fontWeight: 'bold', my: 1 }}>
                      <CountUp 
                        to={metrics.lastWithdrawalAmount} 
                        formatter={(value) => formatCurrency(value)}
                        key={`last-withdrawal-${formData.timestamp}`}
                        duration={1}
                      />
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: metrics.corpusSustainable ? '#10B981' : '#EF4444' 
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: metrics.corpusSustainable ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                        }}
                      >
                        {metrics.corpusSustainable ? 'Sustainable' : 'Not Sustainable'}
                      </Typography>
                    </Box>
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
                        SWP Calculator
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box>
                        <Typography variant="body2" component="label" htmlFor="swp-initial-investment" sx={{ mb: 1 }}>Initial Investment</Typography>
                        <TextField
                          id="swp-initial-investment"
                          name="swp-initial-investment"
                          value={formData.initialAmount}
                          onChange={handleInitialAmountChange}
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
                        <Typography variant="body2" component="label" htmlFor="swp-monthly-withdrawal" sx={{ mb: 1 }}>Monthly Withdrawal</Typography>
                        <TextField
                          id="swp-monthly-withdrawal"
                          name="swp-monthly-withdrawal"
                          value={formData.monthlyWithdrawal}
                          onChange={handleWithdrawalAmountChange}
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
                          <Typography variant="body2" component="label" htmlFor="swp-duration">Withdrawal Duration</Typography>
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
                          id="swp-duration"
                          value={formData.years}
                          min={1}
                          max={40}
                          onChange={handleRangeChange('years')}
                        />
                        <AnimatedProgressBar 
                          value={formData.years} 
                          max={40} 
                          duration={0.5}
                          height={4}
                          foregroundColor={theme.palette.primary.main}
                        />
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" component="label" htmlFor="swp-annual-return">Expected Annual Return</Typography>
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
                          id="swp-annual-return"
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

                      {/* Annual Withdrawal Increase */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" component="label" htmlFor="swp-withdrawal-growth">Annual Withdrawal Increase</Typography>
                          <Box sx={{ 
                            bgcolor: 'rgba(30, 41, 59, 0.5)',
                            px: 2, 
                            py: 0.5, 
                            borderRadius: 1, 
                            display: 'inline-block' 
                          }}>
                            <Typography variant="body2" fontWeight="medium">{formData.withdrawalGrowth}%</Typography>
                          </Box>
                        </Box>
                        <Range
                          id="swp-withdrawal-growth"
                          name="withdrawalGrowth"
                          value={formData.withdrawalGrowth}
                          min={0}
                          max={15}
                          onChange={handleRangeChange('withdrawalGrowth')}
                        />
                        <AnimatedProgressBar 
                          value={formData.withdrawalGrowth} 
                          max={15} 
                          duration={0.5}
                          height={4}
                          foregroundColor={theme.palette.info.main}
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
                                id="swp-include-inflation"
                                name="includeInflation"
                              />
                            } 
                            label={
                              <Typography variant="body2" component="span">
                                Include Inflation
                              </Typography>
                            }
                            htmlFor="swp-include-inflation"
                          />
                        </FormGroup>
                        
                        {formData.includeInflation && (
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" component="label" htmlFor="swp-inflation-rate">Inflation Rate</Typography>
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
                              id="swp-inflation-rate"
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
                        {isCalculating ? 'Calculating...' : 'Calculate Results'}
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
                      Corpus & Withdrawal Projection
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
                        <Typography variant="caption">Corpus</Typography>
                      </Box>
                      <Box className="legend-item">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                        <Typography variant="caption">Withdrawals</Typography>
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
                            <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
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
                              return [formatCurrency(value), name === 'Remaining Corpus' ? 'Remaining Corpus' : 'Annual Withdrawals'];
                            }}
                            labelFormatter={(value) => `Year ${value}`}
                            contentStyle={{ 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Remaining Corpus"
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                            fill="url(#colorCorpus)"
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
                            dataKey="Annual Withdrawals"
                            stroke={theme.palette.success.main}
                            strokeWidth={2}
                            fill="url(#colorWithdrawals)"
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
                          Initial Investment
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formatCurrency(formData.initialAmount)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Monthly Withdrawal
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formatCurrency(formData.monthlyWithdrawal)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Return Rate
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {formData.annualRate}% p.a.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Final Corpus
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="500" 
                          color={metrics.finalCorpus > 0 ? "primary.main" : "error.main"}
                        >
                          {formatCurrency(metrics.finalCorpus)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </AnimatedChart>
            </Box>
          </Box>
        </Box>

        {/* Sustainability Info */}
        <Box sx={{ mt: 6 }}>
          <FadeIn delay={0.3}>
            <Card 
              elevation={3}
              sx={{ 
                bgcolor: 'rgba(20, 30, 50, 0.95)', 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BarChartIcon sx={{ mr: 1 }} />
                    Withdrawal Plan Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analysis of your Systematic Withdrawal Plan (SWP) and its long-term sustainability.
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: metrics.corpusSustainable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${metrics.corpusSustainable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    mb: 4
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: metrics.corpusSustainable ? '#10B981' : '#EF4444',
                        mr: 2
                      }} 
                    />
                    <Typography variant="h6" color={metrics.corpusSustainable ? '#10B981' : '#EF4444'}>
                      {metrics.corpusSustainable 
                        ? 'Your withdrawal plan is sustainable' 
                        : 'Your withdrawal plan may deplete your corpus'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {metrics.corpusSustainable 
                      ? `Your investment corpus is expected to grow to ${formatCurrency(metrics.finalCorpus)} after ${formData.years} years of withdrawals.` 
                      : `Your investment corpus is expected to ${metrics.finalCorpus <= 0 ? 'fully deplete' : 'significantly reduce'} to ${formatCurrency(metrics.finalCorpus)} over the ${formData.years} year period.`}
                  </Typography>
                  
                  <Typography variant="body2">
                    {metrics.corpusSustainable 
                      ? `The monthly withdrawal amount will increase from ${formatCurrency(formData.monthlyWithdrawal)} to ${formatCurrency(metrics.lastWithdrawalAmount)} in the final year.` 
                      : `Consider adjusting your initial investment, decreasing your withdrawal amount, or reducing the withdrawal growth rate to ensure long-term sustainability.`}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(30, 41, 59, 0.7)', 
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Withdrawal Rate
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {((formData.monthlyWithdrawal * 12 / formData.initialAmount) * 100).toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Annual withdrawal as percentage of initial investment
                    </Typography>
                  </Card>
                  
                  <Card 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(30, 41, 59, 0.7)', 
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Growth vs Withdrawal
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {formData.annualRate - ((formData.monthlyWithdrawal * 12 / formData.initialAmount) * 100) > 0 ? '+' : ''}
                      {(formData.annualRate - ((formData.monthlyWithdrawal * 12 / formData.initialAmount) * 100)).toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Net growth rate after withdrawals
                    </Typography>
                  </Card>
                  
                  <Card 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(30, 41, 59, 0.7)', 
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Withdrawals to Initial Ratio
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {(metrics.totalWithdrawalAmount / formData.initialAmount).toFixed(2)}x
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total withdrawals as multiple of initial investment
                    </Typography>
                  </Card>
                </Box>
              </CardContent>
            </Card>
          </FadeIn>
        </Box>
      </Box>
    </Box>
  );
};

export default SWPCalculator;