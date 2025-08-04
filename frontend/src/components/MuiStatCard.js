import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';

const MuiStatCard = ({ title, icon: IconComponent, value, growth, color, background, onClick }) => {
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        zIndex: 1,
        '&:hover': {
          transform: onClick ? 'translateY(-8px)' : 'none',
          boxShadow: onClick ? 8 : 2,
          backgroundColor: onClick ? 'action.hover' : 'background.paper',
          zIndex: 2,
        },
        '&:active': {
          transform: onClick ? 'translateY(-2px)' : 'none',
        },
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) {
          console.log('MuiStatCard clicked!'); // Debug log
          onClick();
        }
      }}
    >
      {/* Top colored bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: `linear-gradient(90deg, ${color}, ${color})`,
        }}
      />
      
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: background,
              color: color,
              mr: 2.5,
            }}
          >
            <IconComponent sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '0.1em',
                fontSize: '0.75rem',
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h3"
          component="div"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            mb: 1,
            fontSize: '2.5rem',
          }}
        >
          {value}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            label={growth}
            size="small"
            sx={{
              backgroundColor: 'success.light',
              color: 'success.dark',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          {onClick && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                opacity: 0.7,
              }}
            >
              Click for details
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MuiStatCard;
