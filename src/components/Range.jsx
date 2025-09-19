import { useState, useEffect, useRef } from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Custom styled slider component
const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 8,
  '& .MuiSlider-thumb': {
    height: 18,
    width: 18,
    backgroundColor: '#fff',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.15)',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0 0 0 2px rgba(0,0,0,0.1), 0 6px 10px rgba(0,0,0,0.2)',
    },
  },
  '& .MuiSlider-track': {
    height: 8,
    borderRadius: 4,
  },
  '& .MuiSlider-rail': {
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Range = ({ 
  id, 
  name,
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  onChange,
  label,
  suffix = "",
  debounce = 200,
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle slider change with debounce
  const handleChange = (_, newValue) => {
    setLocalValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounce);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ mb: 1, width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography 
            component="label" 
            htmlFor={id} 
            variant="body2" 
            color="text.secondary"
          >
            {label}
          </Typography>
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography 
                variant="body1" 
                fontWeight="medium" 
                color="primary"
              >
                {value}{suffix}
              </Typography>
            </motion.div>
          </AnimatePresence>
        </Box>
      )}
      <Box sx={{ position: 'relative' }}>
        <StyledSlider
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          aria-labelledby={id}
          disabled={disabled}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">{min}{suffix}</Typography>
          <Typography variant="caption" color="text.secondary">{max}{suffix}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Range;