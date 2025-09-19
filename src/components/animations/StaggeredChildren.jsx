import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const StaggeredChildren = ({ 
  children, 
  containerDelay = 0, 
  staggerDelay = 0.1, 
  childrenAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  transition = {
    duration: 0.5,
    type: 'spring',
    damping: 15
  },
  ...props 
}) => {
  // Container animation
  const containerAnimation = {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    transition: { 
      delay: containerDelay,
      staggerChildren: staggerDelay 
    }
  };

  // Clone children and wrap each in a motion.div
  const animatedChildren = React.Children.map(children, (child, index) => {
    return (
      <motion.div
        variants={childrenAnimation}
        transition={{
          ...transition,
          delay: containerDelay + (index * staggerDelay)
        }}
      >
        {child}
      </motion.div>
    );
  });

  return (
    <motion.div {...containerAnimation} {...props}>
      {animatedChildren}
    </motion.div>
  );
};

StaggeredChildren.propTypes = {
  children: PropTypes.node.isRequired,
  containerDelay: PropTypes.number,
  staggerDelay: PropTypes.number,
  childrenAnimation: PropTypes.object,
  transition: PropTypes.object,
};

export default StaggeredChildren;