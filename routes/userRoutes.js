const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwtAuthMiddleware = require("../JwtAuth/jwtAuthMiddleware");
const jwtTokenGenerate = require("../JwtAuth/jwtTokenGenerate");

//POST METHOD (SIGNUP)
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //GETTING DATA FROM REQUEST BODY
    const newUser = new User(data); //FORMATTING IT VIA MONGOOSE MODEL

    //MAKING SURE THERE IS ONLY ONE ADMIN
    const adminPresent = await User.findOne({ role: 'admin' })
    if (adminPresent && data.role === 'admin'){
      return res.status(400).json({ error: "Admin already exists!"})
    }

    const savedUser = await newUser.save(); //SAVING IT TO DB
    console.log("Data send successfully");

    const payload = {
      id: savedUser.id,
    };

    const token = jwtTokenGenerate(payload);

    res.status(200).json({ reponse: savedUser, token: token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error: ", error);
  }
});

//(LOGIN)
router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    //CHECKING WHETHER THE NAME AND PASSOWRD ARE CORRECT OR NOT
    if (!user) return res.status(401).json({ error: "Invalid Username.." });
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid Password.." });

    //IF CORRECT THEN GENERATE JWT TOKEN
    const payload = {
      id: user.id,
    };

    const token = jwtTokenGenerate(payload);

    res.json({ token: token });
  } catch (error) {
    console.log("USER ROUTES => LOGIN => ERROR: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET METHOD (PROFILE DATA DISPLAY)
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.userPayload; //EXTRACTING USERPAYLOAD WHERE USER ID AND NAME IS STORED
    console.log("user data: ", userData);

    const userId = userData.id;
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (error) {
    console.log("USER ROUTES => PROFILE => ERROR: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PUT / UPDATE METHOD
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.userPayload.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both current and new password are required" });
    }

    const user = await User.findById(userId);
    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save();

    console.log("PASSWORD UPDATED");
    res.status(200).json({message: "Password Updated"});
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error: ", error);
  }
});

module.exports = router;
