const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
	username: { type: String, required: true, minLength: 2 },
	password: { type: String, required: true, minLength: 4 },
	member_status: { type: Boolean, required: true },
	admin_status: { type: Boolean, required: true },
})

module.exports = mongoose.model('User', UserSchema)
