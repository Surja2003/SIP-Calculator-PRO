import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const AnimatedChart = ({ children, duration = 0.8, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration, 
        delay,
        opacity: { duration: duration * 0.7 },
        scale: { 
          type: "spring", 
          damping: 15, 
          stiffness: 200 
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

AnimatedChart.propTypes = {
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  delay: PropTypes.number
};

export default AnimatedChart;