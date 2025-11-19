const Club = require("../models/Club");
const Volunteer = require("../models/Volunteer");

// סקריפט לסנכרון מתנדבות למועדוניות
// מעבר על כל המתנדבות ועדכון מועדוניות לפי מערך clubs שלהן
const syncClubVolunteers = async () => {
  try {
    console.log("Starting volunteer-club synchronization...");
    
    const volunteers = await Volunteer.find();
    const clubs = await Club.find();
    
    for (const volunteer of volunteers) {
      for (const clubInfo of volunteer.clubs) {
        // מציאת המועדונית לפי שם
        const club = clubs.find(c => c.name === clubInfo.clubName);
        
        if (club && !club.volunteers.includes(volunteer._id)) {
          console.log(`Adding volunteer ${volunteer.fname} ${volunteer.lname} to club ${club.name}`);
          club.volunteers.push(volunteer._id);
          await club.save();
        }
      }
    }
    
    console.log("Synchronization completed successfully!");
    return { success: true, message: "Sync completed" };
  } catch (error) {
    console.error("Error during synchronization:", error);
    return { success: false, error: error.message };
  }
};

module.exports = syncClubVolunteers;
