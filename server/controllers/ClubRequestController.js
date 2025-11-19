const ClubRequest = require("../models/ClubRequest");
const Club = require("../models/Club");
const Child = require("../models/Child");

const createClubRequest = async (req, res) => {
  try {
    // const  childId  = req.user.id; // שימי לב — לא destructuring כפול
    const { clubId, childId} = req.body;

      const childExists = await Child.exists({ _id: childId });
    if (!childExists) {
      throw new Error("Child does not exist");
    }


    // בדיקה אם כבר קיימת בקשה זהה
    const existingRequest = await ClubRequest.findOne({ childId, clubId });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already exists" });
    }

    // יצירת בקשה חדשה
    const newRequest = await ClubRequest.create({ childId, clubId });

    // הוספת הילד לממתינים במועדון (אם עדיין לא שם)
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (!club.waitingChildren.includes(childId)) {
      club.waitingChildren.push(childId);
      await club.save();
    }

    res.status(201).json({ message: "Request created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
};

const getAllClubRequests = async (req, res) => {
  try {
    const requests = await ClubRequest.find()
      .populate('childId', 'Fname Lname childId phone1')
      .populate('clubId', 'name activityDay location');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

// Get a club request by ID
const getClubRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ClubRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error fetching request" });
  }
};


// מחיקת בקשה קיימת
const deleteClubRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ClubRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting request" });
  }
};

module.exports = { createClubRequest, deleteClubRequest ,getClubRequestById,getAllClubRequests};
