import { motion } from 'framer-motion';
import { Box } from '@mui/material';

/**
 * Fade-in animation component
 */
export const FadeIn = ({ children, delay = 0, duration = 0.5 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide-in animation component
 */
export const SlideIn = ({ children, direction = 'up', delay = 0, duration = 0.5 }) => {
  const directionMap = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animated chart component
 */
export const AnimatedChart = ({ children, delay = 0, duration = 0.8 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animated progress bar component
 */
export const AnimatedProgressBar = ({ value, max, duration = 0.5, height = 4, foregroundColor = '#2196F3', backgroundColor = 'rgba(255,255,255,0.1)' }) => {
  const percentage = (value / max) * 100;
  
  return (
    <Box sx={{ width: '100%', height: height, bgcolor: backgroundColor, borderRadius: 1, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration }}
        style={{ 
          height: '100%', 
          backgroundColor: foregroundColor 
        }}
      />
    </Box>
  );
};

/**
 * CountUp animation component
 */
export const CountUp = ({ to, end, duration = 1, decimals = 0, formatter }) => {
  const target = (to ?? end);
  const value = typeof target === 'number' && !isNaN(target) ? target : 0;
  const display = formatter
    ? formatter(value)
    : value.toLocaleString('en-IN', { maximumFractionDigits: decimals });

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {display}
    </motion.span>
  );
};

/**
 * AnimatedText component
 */
export const AnimatedText = ({ children, text, delay = 0, duration = 0.5 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
    >
      {children ?? text}
    </motion.span>
  );
};

/**
 * AnimatedCounter component
 */
export const AnimatedCounter = ({ value, duration = 1, decimals = 0 }) => {
  // Ensure value is a valid number
  const validValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
  
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {validValue.toLocaleString('en-IN', { maximumFractionDigits: decimals })}
    </motion.span>
  );
};