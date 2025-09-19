import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SlideIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'left', 
  distance = 50,
  ...props 
}) => {
  // Determine initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, opacity: 0 };
      case 'right':
        return { x: distance, opacity: 0 };
      case 'top':
        return { y: -distance, opacity: 0 };
      case 'bottom':
        return { y: distance, opacity: 0 };
      default:
        return { x: -distance, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={getInitialPosition()}
      transition={{ 
        duration, 
        delay, 
        type: 'spring', 
        damping: 25, 
        stiffness: 500 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

SlideIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  direction: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  distance: PropTypes.number,
};

export default SlideIn;