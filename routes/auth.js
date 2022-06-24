const express = require('express');
require('dotenv').config();
const router = express.Router();
var cors = require('cors')
const User = require('../database/schemas/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const authorize = require('../middleware/authorize')
const token = process.env.JSON_SECRET

router.use(cors())

//endpoint to register a new user. username,password and email are given in the body of the request
router.post('/signup', [
    body('username', 'Name is too short').isLength({ min: 4 }),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Password is too short').isLength({ min: 5 })
], async (req, res) => {
    const err = validationResult(req)
    try {
        if (!err.isEmpty()) {
            res.status(404).json({err:'Please use valid credentials to create account'});
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const pass = await bcrypt.hash(req.body.password, salt);
            User.create({
                username: req.body.username,
                email: req.body.email,
                password: pass,
                isAdmin: req.body.isAdmin
            }).then(response => {
                res.json(response)
            }
            ).catch(err => {
                res.status(404).json({ err: 'user with this username or email already exists' });
            })
        }
    }
    catch (err) {
        res.status(501).send({ err: 'Internal Server Error' })
    }

})

//endpoint to register a new user. username and password are given in the body of the request
router.post('/login', [
    body('username', 'Please enter a valid email').exists(),
    body('password', 'Password is too short').exists()
], async (req, res) => {
    const err = validationResult(req)
    if (!err.isEmpty()) {
        res.status(404).json(err);
    }
    else {
        const { username, password } = req.body
        try {
            let user = await User.findOne({ username: username })
            if (!user) {
                res.status(404).json({ err: "Invalid username or password" })
            }

            else {
                let passComp = await bcrypt.compare(password, user.password);
                if (!passComp) {
                    res.status(404).json({ err: "Invalid username or password" })
                }

                else {
                    const data = {
                        user: {
                            id: user.id
                        }
                    }

                    if(user.isAdmin)
                    {
                        const authToken = jwt.sign(data, token)
                        res.json({ authToken:authToken,isAdmin:true });
                    }

                    else{
                        const authToken = jwt.sign(data, token)
                        res.json({ authToken });
                    }

                }
            }
        }
        catch (err) {
            res.status(404).json({ err: "internal server error" });
        }
    }
})


//authorization required (auth-token needed as a parameter)
//auth-token of the user whose data is to be fetched is given as the header
router.post('/getuser', authorize, async (req, res) => {
    try {
        let userId = req.user.id
        const result = await User.findById(userId).select('-password')
        if (!result) {
            res.status(404).send('user not found')
        }
        else res.json(result)
    } catch (err) {
        res.status(401).send('Internal Server Error')
    }
})

//authorization required (auth-token needed as a parameter)
//auth-token of the user whose password is to be changed is given as the header
//the new password is given in the body of request
router.put('/forgotpassword', authorize, async (req, res) => {
    try {
        let userId = req.user.id
        const result = await User.findById(userId)

        //find if the user with the given auth-token exists
        if (!result) {
            res.status(404).send('user not found')
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const newPassword = await bcrypt.hash(req.body.password, salt);
            let data = {
                password: newPassword
            }
            let response = await User.findByIdAndUpdate(userId, { $set: data }, { new: true })
            //check if the user exists
            if (!response) {
                res.status(404).send('user not found')
            }
            else res.send('Password Changed Successfully')
        }
    } catch (err) {
        res.status(401).send('Internal Server Error')
    }

})


module.exports = router;