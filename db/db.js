'use strict';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/DATABASE_CHATROOM', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log('The database has connected successfully');
});

db.on('error', (error) => {
    console.error('Error happens when trying to connect the database: ' + error);
});

export default db;