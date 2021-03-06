const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

// router.get("/", (req, res) => {
//   res.send("Hey welcome to users homepage");
// });

// update
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Your account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account");
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json("Your account has been deleted successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});

// get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    // user._doc send the whole documents
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get friends
// please check it after completion of the project
router.get("/:id/friends", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );

    const friendList = [];

    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// follow
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const currentUser = await User.findById(req.params.id);
      const user = await User.findById(req.body.userId);

      if (!currentUser.followings.includes(req.body.userId)) {
        // can follow
        await user.updateOne({ $push: { followers: req.params.id } });
        await currentUser.updateOne({ $push: { followings: req.body.userId } });
        res.status(200).json("You're now following this user " + user.username);
      } else {
        res
          .status(403)
          .json("You've already followed this user " + user.username);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

// unfollow
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const currentUser = await User.findById(req.params.id);
      const user = await User.findById(req.body.userId);

      if (currentUser.followings.includes(req.body.userId)) {
        // can unfollow
        await user.updateOne({ $pull: { followers: req.params.id } });
        await currentUser.updateOne({ $pull: { followings: req.body.userId } });
        res
          .status(200)
          .json("You're now unfollowing this user " + user.username);
      } else {
        res.status(403).json("You can't unfollow this user " + user.username);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
