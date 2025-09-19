import { useState, useEffect, useRef, memo } from 'react';
import { animate, useMotionValue } from 'framer-motion';

/**
 * Enhanced CountUp Component
 * 
 * This is an improved version of the CountUp component that fixes several issues:
 * 1. Prevents unnecessary re-renders by using React.memo
 * 2. Stabilizes the formatter function reference using useRef
 * 3. Adds key-based rendering to force proper re-renders when values change
 * 4. Improves type handling for all input values
 * 5. Optimizes animation logic for better performance
 */
const CountUp = memo(({ 
  to = 0, 
  from = 0, 
  duration = 1.5, 
  formatter = (value) => Math.round(value).toLocaleString(), 
  delay = 0,
  // Add timestamp to force re-render when parent wants to update the animation
  timestamp = Date.now()
}) => {
  // Ensure we're working with numeric values
  const targetValue = typeof to === 'number' ? Math.max(0, to) : 0;
  const startValue = typeof from === 'number' ? Math.max(0, from) : 0;
  
  // Store motion value for animation
  const motionValue = useMotionValue(startValue);
  
  // Store the formatted display value
  const [displayValue, setDisplayValue] = useState(() => {
    try {
      return formatter(startValue);
    } catch (err) {
      console.error("Error formatting initial value:", err);
      return String(Math.round(startValue));
    }
  });
  
  // Store formatter in ref to stabilize it across renders
  const formatterRef = useRef(formatter);
  
  // Update formatter reference if it changes
  useEffect(() => {
    formatterRef.current = formatter;
  }, [formatter]);
  
  // Animation effect
  useEffect(() => {
    // Don't animate if the target is very close to start (prevents flickering)
    if (Math.abs(startValue - targetValue) < 0.1) {
      try {
        setDisplayValue(formatterRef.current(targetValue));
      } catch (err) {
        console.error("Error formatting value:", err);
        setDisplayValue(String(Math.round(targetValue)));
      }
      return;
    }
    
    // Handle special case where target is 0 to prevent animation glitches
    if (targetValue === 0) {
      try {
        setDisplayValue(formatterRef.current(0));
      } catch (err) {
        console.error("Error formatting zero value:", err);
        setDisplayValue("0");
      }
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
          setDisplayValue(formatterRef.current(latest));
        } catch (err) {
          console.error("Error formatting number in CountUp:", err);
          // Fallback to simple formatting
          setDisplayValue(String(Math.round(latest)));
        }
      }
    });
    
    // Clean up animation on unmount or when dependencies change
    return () => animation.stop();
  }, [targetValue, startValue, duration, delay, motionValue, timestamp]); // Include timestamp in deps
  
  // Add a key based on the target value and timestamp to force React to recreate
  // the component when these values change, ensuring proper animation
  return <span key={`${targetValue}-${timestamp}`}>{displayValue}</span>;
});

// Display name for debugging
CountUp.displayName = 'CountUp';

export default CountUp;