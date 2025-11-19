const Club = require("../models/Club");
const createClub = async (req, res) => {
  try {
    const newClub = await Club.create(
      req.body
    )
  
    res.status(201).json({ message: "New club created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating club", error: error.message });
  }
};

const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate('registeredChildren', 'Fname Lname childId phone1 dateOfBirth')
      .populate('waitingChildren', 'Fname Lname childId phone1')
      .populate('volunteers', 'fname lname phone email');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clubs", error: error.message });
  }
};

const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('registeredChildren', 'Fname Lname childId phone1 dateOfBirth')
      .populate('waitingChildren', 'Fname Lname childId phone1')
      .populate('volunteers', 'fname lname phone email');
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: "Error fetching club", error: error.message });
  }
};

const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (req.body.name) club.name = req.body.name;
    if (req.body.activityDay) club.activityDay = req.body.activityDay;
    if (req.body.startTime) club.startTime = req.body.startTime;
    if (req.body.endTime) club.endTime = req.body.endTime;
    if (req.body.location) club.location = req.body.location;
    if (req.body.clubManagers) club.clubManagers = req.body.clubManagers;
    await club.save();
    res.json({ message: "Club updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating club", error: error.message });
  }
};

const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting club", error: error.message });
  }
};

// בקשת הצטרפות למועדון - הוספה ל-waitingChildren
const requestJoinClub = async (req, res) => {
  try {
    const { childId, clubId } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // בדיקה אם כבר רשום
    if (club.registeredChildren.includes(childId)) {
      return res.status(400).json({ message: "Child is already registered to this club" });
    }

    // בדיקה אם כבר ממתין
    if (club.waitingChildren.includes(childId)) {
      return res.status(400).json({ message: "Request already exists" });
    }

    // הוספה לרשימת ממתינים
    club.waitingChildren.push(childId);
    await club.save();

    res.status(201).json({ message: "Join request created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
};

// הוספת ילד למועדון (אישור בקשה)
const addChildToClub = async (req, res) => {
  try {  
    const { childId ,clubId} = req.body; 

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.registeredChildren.includes(childId)) {
      return res.status(400).json({ message: "Child is already registered to this club" });
    }

      club.waitingChildren = club.waitingChildren.filter(
      (id) => id.toString() !== childId
    );
    club.refusedChildren = club.refusedChildren.filter(
      (id) => id.toString() !== childId
    );

    club.registeredChildren.push(childId);
    await club.save();

    // עדכון מערך clubs בילד
    const Child = require("../models/Child");
    const child = await Child.findById(childId);
    if (child) {
      if (!child.clubs.includes(clubId)) {
        child.clubs.push(clubId);
        await child.save();
      }
    }

    res.json({ message: "Child added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding child to club", error: error.message });
  }
}
//דחיה של בקשת ילד להצטרף למודעון
const Refuse = async (req, res) => {
  try {  
    const { childId, clubId } = req.body; 

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // אם הילד לא נמצא כבר ברשימת הדחויים
    
      // הסרה מממתינים אם הוא שם
      club.waitingChildren = club.waitingChildren.filter(
        (id) => id.toString() !== childId
      );
      if (!club.refusedChildren.includes(childId)) {
      // הוספה לרשימת הדחויים
      club.refusedChildren.push(childId);
    }

    await club.save();

    res.json({ message: "Child refused successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

// הסרת ילד ממועדון
const removeChildFromClub = async (req, res) => {
  try {
    const { childId } = req.body;
    const { id } = req.params;    // מזהה המועדון

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (!club.registeredChildren.includes(childId)) {
      return res.status(400).json({ message: "Child is not registered in this club" });
    }

    club.registeredChildren = club.registeredChildren.filter(c => c.toString() !== childId.toString());
    console.log(club.registeredChildren)
    await club.save();

    // הסרת המועדונית ממערך clubs בילד
    const Child = require("../models/Child");
    const child = await Child.findById(childId);
    if (child) {
      child.clubs = child.clubs.filter(c => c.toString() !== id.toString());
      await child.save();
    }

    res.json({ message: "Child removed successfully"

     });
  } catch (error) {
    res.status(500).json({ message: "Error removing child from club", error: error.message });
  }
};

// הוספת מתנדבת למועדון
const addVolunteerToClub = async (req, res) => {
  try {
    const { volunteerId, clubId } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.volunteers.includes(volunteerId)) {
      return res.status(400).json({ message: "Volunteer is already in this club" });
    }

    // הוספת המתנדבת למועדונית
    club.volunteers.push(volunteerId);
    await club.save();

    // עדכון מערך clubs במתנדבת
    const Volunteer = require("../models/Volunteer");
    const volunteer = await Volunteer.findById(volunteerId);
    if (volunteer) {
      // בדיקה אם המועדונית כבר קיימת
      const clubExists = volunteer.clubs.some(c => c.clubName === club.name);
      if (!clubExists) {
        volunteer.clubs.push({ clubName: club.name, child: null });
        await volunteer.save();
      }
    }

    res.json({ message: "Volunteer added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding volunteer to club", error: error.message });
  }
};

// הסרת מתנדבת ממועדון
const removeVolunteerFromClub = async (req, res) => {
  try {
    const { volunteerId, clubId } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (!club.volunteers.includes(volunteerId)) {
      return res.status(400).json({ message: "Volunteer is not in this club" });
    }

    // הסרת המתנדבת מהמועדונית
    club.volunteers = club.volunteers.filter(v => v.toString() !== volunteerId.toString());
    await club.save();

    // הסרת המועדונית ממערך clubs במתנדבת
    const Volunteer = require("../models/Volunteer");
    const volunteer = await Volunteer.findById(volunteerId);
    if (volunteer) {
      volunteer.clubs = volunteer.clubs.filter(c => c.clubName !== club.name);
      await volunteer.save();
    }

    res.json({ message: "Volunteer removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing volunteer from club", error: error.message });
  }
};

module.exports = { createClub, getClubs, getClubById, updateClub, deleteClub, requestJoinClub, addChildToClub ,Refuse,removeChildFromClub, addVolunteerToClub, removeVolunteerFromClub};
