const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwtAuthMiddleware = require("../JwtAuth/jwtAuthMiddleware");
const Candidate = require("../models/candidates");

//FUNC THAT CHECKS WHETHER USER ROLE IS ADMIN OR VOTER
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (error) {
    return false;
  }
};

//POST METHOD (TO ADD A NEW CANDIDATE)
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (! await checkAdminRole(req.userPayload.id)) {
      return res
        .status(403)
        .json({ message: "User doesn't have admin rights!" });
    }

    const data = req.body; //GETTING DATA FROM REQUEST BODY
    const newCandidate = new Candidate(data); //FORMATTING IT VIA MONGOOSE MODEL

    const savedCandidate = await newCandidate.save(); //SAVING IT TO DB
    console.log("Candidate Data saved successfully");

    res.status(200).json({ response: savedCandidate });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error: ", error);
  }
});

//GET METHOD (CANDIDATE LIST DISPLAY)
router.get("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidateList = await Candidate.find();

    res.status(200).json({ candidateList });
  } catch (error) {
    console.log("CANDIDATE ROUTES => / => ERROR: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PUT / UPDATE METHOD (TO UPDATE CANDIDATE DATE)
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (! await checkAdminRole(req.userPayload.id)) {
      return res
        .status(403)
        .json({ message: "User doesn't have admin rights!" });
    }

    const candidateId = req.params.candidateID;
    const updatedData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response)
      return res.status(404).json({ error: "Candidate Not Found!" });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error: ", error);
  }
});

//DELETE METHOD TO DELETE CANDIDATE DATA
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (! await checkAdminRole(req.userPayload.id)) {
      return res
        .status(403)
        .json({ message: "User doesn't have admin rights!" });
    }

    const candidateId = req.params.candidateID;
    const updatedData = req.body;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response)
      return res.status(404).json({ error: "Candidate Not Found!" });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error: ", error);
  }
});

//POST METHOD FOR PUTTING VOTE BY USER OF VOTER ROLE
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateID;
  const userId = req.userPayload.id;
  
  try {
    const selectedCandidate = await Candidate.findById(candidateId);
    const user = await User.findById(userId);

    if(!selectedCandidate){
      return res.status(404).json({ message: "Candidate not found" })
    }
    if(!user){
      return res.status(404).json({ message: "User not found" })
    }
    if(user.isVoted){
      return res.status(400).json({ message: "User have already voted" })
    }
    if(user.role === 'admin'){
      return res.status(403).json({ message: "Admin cannot vote" })
    }

    //UPDATING CANDIDATE DOC
    selectedCandidate.votes.push({user: userId})
    selectedCandidate.voteCount++;
    await selectedCandidate.save();

    //UPDATING USER DOC
    user.isVoted = true
    await user.save();

    res.status(200).json({message: "Your Vote was recored successfully"})

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error: ", error);
  }
})

//GET METHOD TO SEE THE LIVE VOTING COUNT LIST
router.get('/vote/count', async (req, res) => {
  try {

    const candidateList = await Candidate.find().sort({voteCount: 'desc'});

    const voteRecord = candidateList.map((candidate) => {
      return {
        organization: candidate.organization,
        count: candidate.voteCount
      }
    });

    return res.status(200).json(voteRecord);
    
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error: ", error);
  }
})



module.exports = router;
