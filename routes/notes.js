const express = require('express');
const router = express.Router();
const Note = require('../database/schemas/note');
const User = require('../database/schemas/user');
const authorize = require('../middleware/authorize')
var cors = require('cors')

router.use(cors())

//authorization required(auth-token needed as the header)
//endpoint to get all the notes a particular user
router.get('/getNotes', async (req, res) => {
    try {
        let data = await Note.find();
        res.json(data);
    }
    catch (error) {
        res.status(404).send('internal server error')
    }
})

router.post("/createNote", async (req, res) => {
    try {
            let data = {
                email:req.body.email,
                title: req.body.title,
                description: req.body.description
            }
            let result = await Note.create(data);
            if (result.length === 0) {
                res.send("An error Occured");
            }
            else res.json(result);
    } catch (err) {
        res.status(404).send("Internal Server Error")
    }
});


//authorization required(auth-token needed as the header)
//endpoint to delete notes
router.delete('/deleteNote/:id', authorize,async (req, res) => {
    try {
        let userInfo = await User.findById(req.user.id)
        if (!userInfo) {
            res.status(404).send('user not found')
        }

        else if (!userInfo.isAdmin) {
            res.status(401).send('This action is not permitted')
        }
        else {
            let note = await Note.findByIdAndDelete(req.params.id)
            res.json(note);
        }
    } catch (error) {
        res.status(404).send("Internal Server Error")
    }
})



module.exports = router;
