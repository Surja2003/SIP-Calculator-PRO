import { Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const InfoTooltip = ({ title }) => {
  return (
    <Tooltip title={title} arrow placement="top">
      <HelpOutlineIcon 
        sx={{ 
          fontSize: '1rem', 
          ml: 1, 
          color: 'text.secondary',
          cursor: 'help' 
        }} 
      />
    </Tooltip>
  );
};