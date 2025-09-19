import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const AnimatedProgressBar = ({ 
  value, 
  max = 100,
  height = 8,
  duration = 1.5,
  backgroundColor = '#e0e0e0',
  foregroundColor = '#3B82F6',
  animateOnMount = true,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div 
      style={{ 
        width: '100%', 
        height: `${height}px`, 
        backgroundColor, 
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative'
      }}
      {...props}
    >
      <motion.div
        initial={{ width: animateOnMount ? 0 : `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={{ 
          duration, 
          ease: 'easeOut' 
        }}
        style={{ 
          height: '100%', 
          backgroundColor: foregroundColor,
          borderRadius: height / 2
        }}
      />
    </div>
  );
};

AnimatedProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  height: PropTypes.number,
  duration: PropTypes.number,
  backgroundColor: PropTypes.string,
  foregroundColor: PropTypes.string,
  animateOnMount: PropTypes.bool
};

export default AnimatedProgressBar;