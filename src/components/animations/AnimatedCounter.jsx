import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const AnimatedCounter = ({ 
  value, 
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  ...props 
}) => {
  const formatNumber = (value) => {
    const formattedValue = Number(value).toLocaleString('en-IN', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    });
    return `${prefix}${formattedValue}${suffix}`;
  };

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <motion.span
        key={value}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 100, 
          damping: 20,
          duration 
        }}
      >
        {formatNumber(value)}
      </motion.span>
    </motion.span>
  );
};

AnimatedCounter.propTypes = {
  value: PropTypes.number.isRequired,
  duration: PropTypes.number,
  decimals: PropTypes.number,
  prefix: PropTypes.string,
  suffix: PropTypes.string
};

export default AnimatedCounter;