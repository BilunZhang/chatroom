const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const moment = require('moment')

import db from "../db/db";
import Users from './../models/Users'
import Info from './../models/Info'

let onlineUsers = [];
//Create a listenter on the port 3000
server.listen(3000, () => {
    console.log("server running···");
});
//Build interface router to return interface
app.get('/', (req, res) => {
    res.redirect('/static/login.html');
});
app.get('/register', (req, res) => {
    res.redirect('/static/register.html');
});
app.get('/index', (req, res) => {
    res.redirect(`/static/index.html?name=${req.query.name}`);
});
//Get and use stastic files in express.js
app.use('/static', express.static(path.join(__dirname, './../public')));
//Build router to return array
app.get('/getUser', (req, res, next) => {
    let infoArr = [];
    getAllMsg().then(result => {
        result.forEach(item => {
            item.user_info.forEach(infoItem => {
                infoArr.push({
                    user_name: item.user_name,
                    info_time: infoItem.info_time,
                    info_msg: infoItem.info_msg
                })
            })
        })
        for (let j = 0; j < infoArr.length - 1; j++) {
            let done = true;
            for (let i = 0; i < infoArr.length - 1 - j; i++) {
                if (infoArr[i].info_time > infoArr[i + 1].info_time) {
                    let temp = infoArr[i];
                    infoArr[i] = infoArr[i + 1];
                    infoArr[i + 1] = temp;
                    done = false;
                }
            }
            if (done) {
                break;
            }
        }
        res.json({ infoArr, onlineUsers })
    })
})

//Build socket.io connection to achieve client-server real-time communication
io.on('connection', (socket) => {
    socket.on('register', userData => {
        register(userData, socket);
    });
    socket.on('login', userData => {
        login(userData, socket);
    })
    socket.on('logout', data => {
        onlineUsers = onlineUsers.filter(item => item !== data);
        io.emit('userChange', onlineUsers);
    })
    socket.on('message', (userData) => {
        userData.info_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        addMsgByID(userData).then(res => {
            io.emit('message', userData);
        })
    });
});


const signUp = (userData) => {
        return new Promise((resolve, reject) => {
            const user_name = userData.user_name;
            const user_pass = userData.user_pass;
            const user = new Users({
                user_name,
                user_pass
            })
            user.save((err, result) => {
                if (err) reject(err);
                else {
                    resolve({
                        status: 200,
                        msg: "sign up successfully!"
                    })
                }
            })
        });
    }
    //Determine if the users has signed up or not
const isRegister = (user_name) => {
    return new Promise((resolve, reject) => {
        Users.find({ user_name: user_name }, (err, docs) => {
            if (err) reject(err);
            else {
                if (docs.length === 0) {
                    // not sign up
                    resolve({
                        status: 200,
                        code: 0,
                        msg: 'Not sign up'
                    })
                } else {
                    resolve({
                        status: 200,
                        code: 1,
                        msg: 'Already sign up',
                        user: docs
                    })
                }
            }
        })
    });
}

//Determine if the users have already logged in via the array data
const isLogin = (user_name) => {
    onlineUsers.forEach(item => {
        if (item === user_name) {
            return true;
        }
    })
    return false;
}

//Determine the register result (refer to register.js file)
const register = (userData, socket) => {
    isRegister(userData.user_name).then(result => {
        if (result.code === 0) { // not sign up
            signUp(userData).then(res => {
                if (res.status === 200) {
                    socket.emit('registerResult', { code: 1 });
                }
            })
        } else {
            socket.emit('registerResult', { code: 0 });
        }
    })
}

//Determine the login result (refer to login.js file)
const login = (userData, socket) => {
        isRegister(userData.user_name).then(result => {
            if (result.code === 0) { // not sign up
                socket.emit('loginResult', { code: 0 });
            } else {
                if (userData.user_pass === result.user[0].user_pass) {
                    if (isLogin(userData.user_name)) {
                        socket.emit('loginResult', { code: 2 });
                    } else {
                        addOnlineUser(userData.user_name);
                        socket.emit('loginResult', { code: 3 });
                    }
                } else {
                    socket.emit('loginResult', { code: 1 });
                }
            }
        })
    }
    //Get chat room online user name and emit the info to the client side to broadcast
const addOnlineUser = user_name => {
    onlineUsers.push(user_name);
    io.emit('userChange', onlineUsers);
}

//Get chat room history data
const getAllMsg = () => {
    return new Promise((resolve, reject) => {
        Info.find((err, docs) => {
            if (err) reject(err);
            else resolve(docs)
        })
    })
}
const hasMsgOrNot = (user_name) => {
    return new Promise((resolve, reject) => {
        Info.find({ user_name: user_name }, (err, docs) => {
            if (err) reject(err);
            return resolve(docs.length !== 0);
        })
    })
}
const addMsgByID = (userData) => {
    return new Promise((resolve, reject) => {
        hasMsgOrNot(userData.user_name).then(judge => {
            if (judge) {
                Info.updateOne({ user_name: userData.user_name }, {
                    $addToSet: {
                        user_info: {
                            info_time: userData.info_time,
                            info_msg: userData.info_msg
                        }
                    }
                }, (err) => {
                    if (err) reject(err);
                    else resolve({
                        status: 200,
                        msg: 'add msg successfully'
                    })
                })
            } else {
                const user_name = userData.user_name;
                const user_info = [{
                    info_time: userData.info_time,
                    info_msg: userData.info_msg
                }];
                const info = new Info({
                    user_name,
                    user_info
                })
                info.save((err, result) => {
                    if (err) reject(err);
                    else {
                        resolve({
                            status: 200,
                            msg: "add msg successfully!"
                        })
                    }
                })
            }
        })
    })
}