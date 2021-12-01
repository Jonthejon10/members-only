const User = require('../models/user')
const Message = require('../models/message')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const passport = require('passport')
const async = require('async')
require('dotenv').config()

// MESSAGE LIST
exports.message_list = (req, res, next) => {
	Message.find({}, 'title timestamp text author')
		.sort({ title: 1 })
		.populate('author')
		.exec((err, list_message) => {
			if (err) {
				return next(err)
			}
			res.render('index', {message_list: list_message})
		})
}

// DELETE MESSAGE
exports.message_delete_post = (req, res, next) => {
	async.parallel(
		{
			message: (callback) => {
				Message.findById(req.params.id).exec(callback)
			},
		},
		(err, results) => {
			if (err) {
				return next(err)
			}
			Message.findByIdAndRemove(
				req.body.messageid,
				function deletemessage(err) {
					if (err) {
						return next(err)
					}
					res.redirect('/')
				}
			)
		}
	)
}


// SIGN UP
exports.sign_up_get = (req, res, next) => {
    res.render('sign_up_form')
}

exports.sign_up_post = [
	// Validation and sanitization of fields
	body('username', 'Username cannot be empty !')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('password', 'Password must be at least 4 characters long !')
		.trim()
		.isLength({ min: 4 })
		.escape(),
	body(
		'password-confirmation',
		)
        .notEmpty()
        .custom((value , { req }) => {
            if (value !== req.body.password) {
                throw new Error(
					'Password confirmation field must have the same value as the password field'
				)
            }
            return true;
        }),

	async (req, res, next) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			res.render('sign_up_form', { errors: errors.array() })
			return
		}
		
		try {
			const existingUser = await User.find({
				username: req.body.username,
			})

			if (existingUser.length > 0) {
				res.render('sign_up_form', {
					error: 'Username is already taken !',
				})
				return
			}
		} catch (err) {
			return next(err)
		}
		
		bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
			if (err) {
				return next(err)
			}
			const user = new User({
				username: req.body.username,
				password: hashedPassword,
				member_status: false,
				admin_status: false,
			}).save((err) => {
				if (err) {
					return next(err)
				}
			})
			res.redirect('/')
		})

	}
]

// LOG IN
exports.log_in_get = (req, res, next) => {
	if (res.locals.currentUser) return res.redirect('/') 
	res.render('log_in_form')
}

exports.log_in_post = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/log-in',
})

// LOG OUT
exports.log_out = (req, res, next) => {
	req.logout()
	res.redirect('/')
}

// MEMBER STATUS
exports.member_get = (req, res, next) => {
	if (res.locals.currentUser) {
		res.render('member_form')
	} else {
		res.render('error')
	}
}

exports.member_post = [
	body('password')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Secret password must be specified.'),
	async (req, res, next) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			res.render('member_form', { errors: errors.array() })
			return
		} else if (req.body.password !== process.env.member_pass) {
			res.render('member_form', { passErr: 'Wrong password' })
			return
		}

		const user = new User(res.locals.currentUser)
		user.member_status = true

		await User.findByIdAndUpdate(
			res.locals.currentUser._id,
			user,
			{},
			(err) => {
				if (err) return next(err)
				return res.redirect('/')
			}
		)
	},
]

// ADMIN STATUS
exports.admin_get = (req, res, next) => {
	if (res.locals.currentUser) {
		res.render('admin_form')
	} else {
		res.render('error')
	}
}

exports.admin_post = [
	body('password')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Secret password must be specified.'),
	async (req, res, next) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			res.render('admin_form', { errors: errors.array() })
			return
		} else if (req.body.password !== process.env.admin_pass) {
			res.render('admin_form', { passErr: 'Wrong password' })
			return
		}

		const user = new User(res.locals.currentUser)
		user.admin_status = true

		await User.findByIdAndUpdate(
			res.locals.currentUser._id,
			user,
			{},
			(err) => {
				if (err) return next(err)
				return res.redirect('/')
			}
		)
	},
]

// MESSAGE
exports.message_get = (req, res, next) => {
	if (res.locals.currentUser) {
		res.render('message_form')
	} else {
		res.render('error')
	}
}

exports.message_post = [
	body('title', 'Title cannot be empty !')
		.trim()
		.isLength({ min: 1 })
		.escape(),

	body('text', 'Text cannot be empty !')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	
	async (req, res, next) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			res.render('message_form', { errors: errors.array() })
			return
		}
	
		const message = new Message({
			title: req.body.title,
			timestamp: new Date(),
			text: req.body.text,
			author: res.locals.currentUser._id,
		}).save((err) => {
			if (err) {
				return next(err)
			}
		})
		res.redirect('/')
	}
]