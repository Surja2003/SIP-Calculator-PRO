import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ScaleIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  initialScale = 0.8,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ scale: initialScale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: initialScale, opacity: 0 }}
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

ScaleIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  initialScale: PropTypes.number,
};

export default ScaleIn;