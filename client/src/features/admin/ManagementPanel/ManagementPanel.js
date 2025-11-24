import React, { useMemo } from "react";
import { Box, Typography, Grid, Alert } from "@mui/material";
import {
  People as PeopleIcon,
  Group as GroupIcon,
  VolunteerActivism as VolunteerIcon,
  Mail as MailIcon,
  HourglassEmpty as HourglassIcon,
} from "@mui/icons-material";
import { useGetChildrenQuery } from "../../../api/childApi";
import { useGetClubsQuery } from "../../../api/clubApi";
import { useGetVolunteersQuery } from "../../../api/volunteerApi";
import { useGetAllMessagesQuery } from "../../../api/messageApi";
import StatCard from "./StatCard";
import AdminManagement from "./AdminManagement";
import "./styles/ManagementPanel.css";

const ManagementPanel = () => {
  const { data: children, isLoading: childrenLoading, isError: childrenError } = useGetChildrenQuery();
  const { data: clubs, isLoading: clubsLoading, isError: clubsError } = useGetClubsQuery();
  const { data: volunteers, isLoading: volunteersLoading, isError: volunteersError } = useGetVolunteersQuery();
  const { data: messages, isLoading: messagesLoading, isError: messagesError } = useGetAllMessagesQuery();

  const stats = useMemo(() => {
    const totalChildren = children?.filter(child => child.isApproved && child.isVerified)?.length || 0;
    const totalClubs = clubs?.length || 0;
    const totalVolunteers = volunteers?.length || 0;
    const unreadMessages = messages?.filter(m => !m.readen)?.length || 0;
    const pendingRequests = children?.filter(child => child.isVerified && !child.isApproved)?.length || 0;

    return { totalChildren, totalClubs, totalVolunteers, unreadMessages, pendingRequests };
  }, [children, clubs, volunteers, messages]);

  const hasError = childrenError || clubsError || volunteersError || messagesError;

  return (
    <Box className="management-panel-container" dir="rtl">
      <Typography variant="h3" className="management-panel-title">
        לוח הניהול
      </Typography>

      <div className="management-panel-description">
        <Typography variant="h6" className="management-panel-subtitle">
          סקירה כללית של המערכת והפעילות
        </Typography>
      </div>

      {hasError && (
        <Alert severity="error" className="management-panel-alert">
          שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.
        </Alert>
      )}

      {/* כרטיסי סטטיסטיקה עיקריים */}
      <Grid container spacing={8} className="stats-grid">
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="סך הילדים"
            value={stats.totalChildren}
            icon={PeopleIcon}
            color="#87c8d2"
            isLoading={childrenLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="בקשות ממתינות"
            value={stats.pendingRequests}
            icon={HourglassIcon}
            color="#87c8d2"
            isLoading={childrenLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="מתנדבות"
            value={stats.totalVolunteers}
            icon={VolunteerIcon}
            color="#87c8d2"
            isLoading={volunteersLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="מועדוניות"
            value={stats.totalClubs}
            icon={GroupIcon}
            color="#87c8d2"
            isLoading={clubsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="הודעות חדשות"
            value={stats.unreadMessages}
            icon={MailIcon}
            color="#87c8d2"
            isLoading={messagesLoading}
          />
        </Grid>
      </Grid>

      {/* ניהול מנהלי האתר */}
      <AdminManagement />
    </Box>
  );
};

export default ManagementPanel;
