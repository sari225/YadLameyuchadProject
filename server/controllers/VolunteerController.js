const Volunteer = require('../models/Volunteer')

// Volunteer Controller Functions

const createVolunteer = async (req, res) => {
	try {
		const newVolunteer = await Volunteer.create(req.body)
		res.status(201).json({ message: 'Volunteer created successfully' })
	} catch (error) {
		res.status(500).json({ message: 'Error creating volunteer', error: error.message })
	}
}

const getVolunteers = async (req, res) => {
	try {
		const volunteers = await Volunteer.find().populate('clubs.child')
		res.json(volunteers)
	} catch (error) {
		res.status(500).json({ message: 'Error fetching volunteers', error: error.message })
	}
}

const getVolunteerById = async (req, res) => {
	try {
		const volunteer = await Volunteer.findById(req.params.id).populate('clubs.child')
		if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' })
		res.json(volunteer)
	} catch (error) {
		res.status(500).json({ message: 'Error fetching volunteer', error: error.message })
	}
}

const updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    const allowed = ["id", "fname", "lname", "school", "phone", "address", "email", "dateBorn"];
    allowed.forEach((field) => {
      if (typeof req.body[field] !== "undefined") {
        // אם מדובר בשדה אימייל ונשלחה מחרוזת ריקה — ננקה את הערך
        if (field === "email" && req.body.email.trim() === "") {
          volunteer.email = undefined; // או אפשרות אחרת: delete volunteer.email;
        } else {
          volunteer[field] = req.body[field];
        }
      }
    });

    await volunteer.save();
    res.json({ message: "Volunteer updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating volunteer", error: error.message });
  }
};

const deleteVolunteer = async (req, res) => {
	try {
		const deleted = await Volunteer.findByIdAndDelete(req.params.id)
		if (!deleted) return res.status(404).json({ message: 'Volunteer not found' })
		res.json({ message: 'Volunteer deleted successfully' })
	} catch (error) {
		res.status(500).json({ message: 'Error deleting volunteer', error: error.message })
	}
}
const addClubToVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { clubName, child} = req.body;

    // שליפת המתנדבת
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }


    // הוספת המועדון והילד למערך
    volunteer.clubs.push({ clubName, child});

    await volunteer.save();
    res.json({ message: "Club added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding club", error: error.message });
  }
};
const updateClubInVolunteer = async (req, res) => {
  try {
    const { volunteerId, clubId } = req.params;
    const { clubName, child } = req.body;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    const club = volunteer.clubs.id(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (clubName) club.clubName = clubName;
    if (child) club.child = child;

    await volunteer.save();
    res.json({ message: "Club updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating club", error: error.message });
  }
};

const removeClubFromVolunteer = async (req, res) => {
  try {
    const { volunteerId, clubId } = req.params;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    // אם זה מערך של ObjectIds או אובייקטים
    volunteer.clubs = volunteer.clubs.filter(c => c.toString() !== clubId && c._id?.toString() !== clubId);

    await volunteer.save();
    res.json({ message: "Club removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing club", error: error.message });
  }
};




module.exports = {
	createVolunteer,
	getVolunteers,
	getVolunteerById,
	updateVolunteer,
	deleteVolunteer,
  addClubToVolunteer,
  updateClubInVolunteer,
  removeClubFromVolunteer
}

            
