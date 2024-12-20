const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// @route      GET api/auth
// @desc       Get logged in user
// @access     Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await  User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});
~

router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });
			if (!user) {
				return res.status(400).json({ msg: 'Invaild Credentials' });
			}

		

			const payload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{
					expiresIn: 360000
				},
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
)
// router.post(
//     '/',
//     [
//         check('email', 'Please include a valid email').isEmail(),
//         check('password', 'Password is required').exists()
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { email, password } = req.body;

//         try {
//             let user = await User.findOne({ email });
//             if (!user) {
//                 return res.status(400).json({ msg: 'Invalid Credentials' });
//             }

            
//             // Instead of a JWT, return the user data (excluding sensitive information)
//             const userData = {
//                 id: user.id,
//                 email: user.email,
//                 // Add any other non-sensitive fields you want to return
//             };

//             res.json({ user: userData }); // Return user data
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send('Server Error');
//         }
//     }
// );



module.exports = router;
