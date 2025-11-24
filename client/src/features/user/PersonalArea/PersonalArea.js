import React, { useMemo, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Group as GroupIcon, Event as CampIcon, ContactPhone as ContactIcon, Person as PersonIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useGetClubsQuery } from "../../../api/clubApi";
import { useGetDayCampsQuery } from "../../../api/dayCampApi";
import { useGetChildByIdQuery } from "../../../api/childApi";
import UpdatesSection from "./UpdatesSection";
import ContactDialog from "./ContactDialog";
import "./styles/personalAreaStyles.css";

const PersonalArea = () => {
  const { token } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  const userName = decoded?.name || "משתמש";
  const childId = decoded?.id;

  const { data: clubs = [], refetch: refetchClubs } = useGetClubsQuery();
  const { data: dayCamps = [], refetch: refetchDayCamps } = useGetDayCampsQuery();
  const { data: childData, refetch: refetchChild } = useGetChildByIdQuery(childId, { skip: !childId });

  useEffect(() => {
    refetchClubs();
    refetchDayCamps();
    if (childId) refetchChild();
  }, [refetchClubs, refetchDayCamps, refetchChild, childId]);

  const myClubsCount = useMemo(() => childData?.clubs?.length || 0, [childData]);

  const activeCamp = useMemo(() => {
    if (!dayCamps.length) return null;
    const today = new Date();
    return dayCamps.find(camp => {
      if (!camp.startDate || !camp.endDate) return false;
      const startDate = new Date(camp.startDate);
      const endDate = new Date(camp.endDate);
      return today >= startDate && today <= endDate;
    });
  }, [dayCamps]);

  return (
    <div className="main-container" dir="rtl">
      <div className="welcome-container">
        <Typography variant="h3" className="welcome-title">
          ברוך הבא, {userName}!
        </Typography>
        <Typography variant="h6" className="welcome-subtitle">
          שמחים לראות אותך באזור האישי שלך
        </Typography>
      </div>

      <div className="stats-container">

        <div className="stat-item">
          <div className="content-container">
            <Typography variant="h2" className="stat-number">
              {myClubsCount}
            </Typography>
          </div>
          <Typography className="stat-label">
            <GroupIcon style={{ fontSize: '1.2em', verticalAlign: 'middle', marginLeft: 4 }} />
            המועדוניות שלי
          </Typography>
        </div>

        <div className="stat-item">
          <div className="content-container">
            <Typography
              variant={activeCamp ? "h5" : "h6"}
              className={activeCamp ? "active-camp-text" : "no-camp-text"}
            >
              {activeCamp ? activeCamp.name : "אין קייטנה פעילה כרגע"}
            </Typography>
          </div>
          <Typography className="stat-label">
            <CampIcon style={{ fontSize: '1.2em', verticalAlign: 'middle', marginLeft: 4 }} />
            קייטנה פעילה
          </Typography>
        </div>

        <div className="quick-links-column">
          <div className="quick-link-item contact-button" onClick={() => setContactDialogOpen(true)}>
            <ContactIcon className="icon" />
            <Typography>יצירת קשר</Typography>
          </div>
          <div className="quick-link-item profile-button" onClick={() => navigate("/user/profile")}>
            <PersonIcon className="icon" />
            <Typography>הפרופיל שלי</Typography>
          </div>
        </div>
      </div>

      <ContactDialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} />
      <UpdatesSection />
    </div>
  );
};

export default PersonalArea;
