import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import PropTypes from 'prop-types';

const CountUp = ({ 
  from = 0, 
  to, 
  duration = 1.5, 
  delay = 0,
  formatter = (value) => Math.round(value).toString(),
  ...props 
}) => {
  // Create a reference for the span element
  const nodeRef = useRef(null);
  
  // Create a motion value to animate
  const count = useMotionValue(from);
  
  // Transform the count to a formatted string
  const formattedCount = useTransform(count, (value) => {
    try {
      const validValue = isNaN(value) ? 0 : Number(value);
      return formatter(validValue);
    } catch {
      return '0';
    }
  });

  useEffect(() => {
    // Ensure 'to' is a valid number, otherwise default to 0
    const targetValue = (isNaN(to) || to === null || to === undefined) ? 0 : Number(to);
    
    // Animate the count to the target value with a smooth spring
    const animation = animate(count, targetValue, {
      type: 'spring',
      stiffness: 200,
      damping: 28,
      mass: 1,
      delay
    });
    
    // Clean up the animation when the component unmounts or when dependencies change
    return animation.stop;
  }, [to, delay, from, formatter]);

  return (
    <motion.span
      ref={nodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {formattedCount}
    </motion.span>
  );
};

CountUp.propTypes = {
  from: PropTypes.number,
  to: PropTypes.number.isRequired,
  duration: PropTypes.number,
  delay: PropTypes.number,
  formatter: PropTypes.func,
};

// Adding default props for clarity
CountUp.defaultProps = {
  from: 0,
  duration: 1.5,
  delay: 0,
  formatter: (value) => Math.round(value).toString()
};

export default CountUp;