import mongoose from 'mongoose'

const usersSchema = mongoose.Schema({
    user_name: {type: String, required: true},
    user_pass: {type: String, required: true},
})
const Users = mongoose.model('users', usersSchema);
export default Users;