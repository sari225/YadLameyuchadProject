import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import "./styles/StatCard.css";

const StatCard = ({ title, value, icon: Icon, color, isLoading, subtitle }) => {
  return (
    <Box className="stat-card">
      <Box className="stat-card-content">
        <Box className="stat-card-icon">
          <Icon />
        </Box>
        {isLoading ? (
          <CircularProgress size={28} sx={{ color: '#87c8d2' }} />
        ) : (
          <Typography className="stat-card-value">
            {value}
          </Typography>
        )}
        <Typography className="stat-card-title">{title}</Typography>
        {subtitle && (
          <Typography className="stat-card-subtitle">{subtitle}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default StatCard;
