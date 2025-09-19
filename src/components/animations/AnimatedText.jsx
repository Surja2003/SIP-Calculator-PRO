import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const AnimatedText = ({
  text,
  delay = 0,
  duration = 0.05,
  staggerChildren = 0.02,
  color = null,
  ...props
}) => {
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren,
        delayChildren: delay,
      }
    }
  };

  // Split text into individual characters or words
  const characters = text.split('');

  return (
    <motion.span
      style={{ display: 'inline-block', color }}
      variants={container}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={letterVariants}
          transition={{ duration }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

AnimatedText.propTypes = {
  text: PropTypes.string.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  staggerChildren: PropTypes.number,
  color: PropTypes.string
};

export default AnimatedText;