const express = require('express');
const router = express.Router();
const Note = require('../database/schemas/note');
const User = require('../database/schemas/user');
const authorize = require('../middleware/authorize')
var cors = require('cors')

router.use(cors())

//authorization required(auth-token needed as the header)
//endpoint to get all the notes a particular user
router.get('/getNotes', authorize, async (req, res) => {
    try {
        //check if the user exists
        let userInfo = await User.findById(req.user.id)
        //if the user does not exist
        if (!userInfo) {
            res.status(404).send('user not found')
        }

        //if the user exists send the details of the note
        else {
            let data = await Note.find({ userId: req.user.id });
            res.json(data);
        }
    } catch (error) {
        res.status(404).send('internal server error')
    }
})

//authorization required(auth-token needed as the header)
//endpoint to create notes for a particular user
router.post("/createNote", authorize, async (req, res) => {
    try {
        //check if the user exists
        let userInfo = await User.findById(req.user.id)
        //if the user does not exist
        if (!userInfo) {
            res.status(404).send('user not found')
        }
        //if the user exists create the note and send the details of the note
        else {
            let data = {
                title: req.body.title,
                description: req.body.description,
                userId: req.user.id
            }
            let result = await Note.create(data);
            if (result.length===0) {
                res.send("An error Occured");
            }
            else res.json(result);
        }
    } catch (err) {
        res.status(404).send("Internal Server Error")
    }
});

router.put('/updateNote/:id', authorize, async (req, res) => {
    try {
        //check if the user exists
        let userInfo = await User.findById(req.user.id)
        let upnote = await Note.findById(req.params.id)
        //if the user does not exist
        if (!userInfo || !upnote) {
            res.status(404).send('user/note not found')
        }

        else if (req.user.id != upnote.userId) {
            res.status(401).send('This action is not permitted')
        }
        //if the user exists create the note and send the details of the note
        else {
            let note = await Note.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.json(note);
        }
    } catch (error) {
        res.status(404).send("Internal Server Error")
    }
})

router.delete('/deleteNote/:id', authorize, async (req, res) => {
    try {
        //check if the user exists
        let userInfo = await User.findById(req.user.id)
        let upnote = await Note.findById(req.params.id)
        //if the user does not exist
        if (!userInfo || !upnote) {
            res.status(404).send('user/note not found')
        }

        else if (req.user.id != upnote.userId) {

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
