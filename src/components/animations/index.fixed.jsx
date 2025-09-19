import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Box } from '@mui/material';
import CountUpFixed from './CountUp.fixed';

// Use the fixed CountUp component
export const CountUp = CountUpFixed;

// Fade In Animation
export const FadeIn = ({ children, delay = 0, duration = 0.5, key = Date.now() }) => {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Slide In Animation
export const SlideIn = ({ children, direction = "left", delay = 0, duration = 0.5, key = Date.now() }) => {
  const directionMap = {
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    top: { x: 0, y: -30 },
    bottom: { x: 0, y: 30 }
  };

  return (
    <motion.div
      key={key}
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
export const AnimatedChart = ({ children, delay = 0, duration = 0.8, key = Date.now() }) => {
  return (
    <motion.div
      key={key}
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
export const AnimatedText = ({ text, delay = 0, duration = 0.8, key = Date.now() }) => {
  return (
    <motion.span
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
};

// Animated Progress Bar
export const AnimatedProgressBar = ({ 
  value = 0, 
  max = 100, 
  height = 6, 
  duration = 0.8, 
  delay = 0,
  foregroundColor = '#3B82F6',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  key = Date.now()
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
      key={key}
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