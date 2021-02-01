import mongoose from 'mongoose'

const infoSchema = mongoose.Schema({
    user_name: {type: String, required: true},
    user_info: {type: Array, required: true}
})
const Info = mongoose.model('info', infoSchema);
export default Info;