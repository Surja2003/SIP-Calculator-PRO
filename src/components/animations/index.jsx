import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Box, LinearProgress } from '@mui/material';

// Fade In Animation
export const FadeIn = ({ children, delay = 0, duration = 0.5 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Slide In Animation
export const SlideIn = ({ children, direction = "left", delay = 0, duration = 0.5 }) => {
  const directionMap = {
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    top: { x: 0, y: -30 },
    bottom: { x: 0, y: 30 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0,
        ...directionMap[direction]
      }}
      animate={{ 
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Animated Chart Container
export const AnimatedChart = ({ children, delay = 0, duration = 0.8 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// Animated Text
export const AnimatedText = ({ text, delay = 0, duration = 0.8 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
};

// CountUp Component - Animated Number Counter
export const CountUp = ({ 
  to = 0, 
  from = 0, 
  duration = 1.5, 
  formatter = (value) => Math.round(value).toLocaleString(), 
  delay = 0 
}) => {
  const motionValue = useMotionValue(from);
  const [displayValue, setDisplayValue] = useState(formatter(from));
  
  useEffect(() => {
    // Prevent negative values
    const targetValue = Math.max(0, to);
    
    // Don't animate if the target is very close to start (prevents flickering)
    if (Math.abs(from - targetValue) < 0.1) {
      setDisplayValue(formatter(targetValue));
      return;
    }
    
    // Handle special case where target is 0 to prevent animation glitches
    if (targetValue === 0) {
      setDisplayValue(formatter(0));
      return;
    }
    
    // For very large numbers, adjust duration to make animation smoother
    let adjustedDuration = duration;
    if (targetValue > 10000000) {
      adjustedDuration = Math.min(2, duration + 0.5);
    }
    
    // Start the animation
    const animation = animate(motionValue, targetValue, {
      duration: adjustedDuration,
      delay,
      ease: "easeOut",
      onUpdate: (latest) => {
        try {
          setDisplayValue(formatter(latest));
        } catch (err) {
          console.error("Error formatting number in CountUp:", err);
          // Fallback to simple formatting
          setDisplayValue(Math.round(latest).toLocaleString());
        }
      }
    });
    
    // Clean up animation on unmount or when dependencies change
    return animation.stop;
  }, [from, to, duration, delay, motionValue, formatter]);
  
  return <span>{displayValue}</span>;
};

// Animated Progress Bar
export const AnimatedProgressBar = ({ 
  value = 0, 
  max = 100, 
  height = 6, 
  duration = 0.8, 
  delay = 0,
  foregroundColor = '#3B82F6',
  backgroundColor = 'rgba(255, 255, 255, 0.1)'
}) => {
  const progressPercentage = Math.min(100, Math.max(0, (value / max) * 100));
  const progressValue = useMotionValue(0);
  const scaleX = useTransform(progressValue, [0, 100], [0, 1]);
  
  useEffect(() => {
    const animation = animate(progressValue, progressPercentage, {
      duration,
      delay,
      ease: "easeOut"
    });
    
    return animation.stop;
  }, [progressPercentage, duration, delay, progressValue]);
  
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: height, 
        bgcolor: backgroundColor,
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <motion.div 
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: foregroundColor,
          borderRadius: '4px',
          transformOrigin: 'left',
          scaleX
        }}
      />
    </Box>
  );
};

export default {
  FadeIn,
  SlideIn,
  AnimatedChart,
  CountUp,
  AnimatedText,
  AnimatedProgressBar
};