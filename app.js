const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const mongoose = require('mongoose');
ongoose.connect('mongodb://localhost:27017/DATABASE_CHATROOM', { useNewUrlParser: true, useUnifiedTopology: true });
let onlineUsers = [];
server.listen(3000, () => {
    console.log("server running···");
});
//页面路由 （返回界面）
app.get('/', (req, res) => {
    res.redirect('/static/login.html');
});
app.get('/register', (req, res) => {
    res.redirect('/static/register.html');
});
app.get('/index', (req, res) => {
    res.redirect(`/static/index.html?name=${req.query.name}`);
});
app.use('/static', express.static(path.join(__dirname, './public')));

//接口路由 （返回数据）
app.get('/getUser', (req, res, next) => {
    const userArr = onlineUsers.map(item => item.name)
    res.json({ userArr })
})

io.on('connection', (socket) => {
    socket.on('register', data => {
        register(data, socket);
    });
    socket.on('login', data => {
        login(data, socket);
    })
    socket.on('logout', data => {
        onlineUsers = onlineUsers.filter(item => item.name !== data);
        const userArr = onlineUsers.map(item => item.name)
        io.emit('userChange', userArr);
    })
    socket.on('message', (data) => {
        io.emit('message', data);
    });
});

const addOnlineUser = data => {
        onlineUsers.push({ name: data.name });
        const userArr = onlineUsers.map(item => item.name)
        io.emit('userChange', userArr);
    }
    //connect MongoDB
const connectDB = () => {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, function(err, db) {
                if (err) {
                    reject(err);
                }
                const dbo = db.db("DATABASE_CHATROOM");
                const collection = dbo.collection("userlist");
                resolve({
                    db: db,
                    collection: collection
                });
            });
        });
    }
    //judge user sign up or not (find)
const isRegister = (dbObj, name) => {
        return new Promise((resolve, reject) => {
            dbObj.collection.find({ name: name }).toArray(function(err, result) {
                if (err) {
                    reject(err);
                }
                resolve(Object.assign(dbObj, { result: result }));
            });
        });
    }
    //insert account info into DB
const addUser = (dbObj, userData) => {
    return new Promise((resolve, reject) => {
        dbObj.collection.insertOne(userData, function(err, res) {
            if (err) {
                reject(err);
            }
            resolve(Object.assign(dbObj, res));
            dbObj.db.close();
        });
    });
}

//Jusge if users have already logged in via array!!!
const isLogin = (data) => {
        let flag = false;
        onlineUsers.map((user) => {
            if (user.name === data.name) {
                flag = true;
            }
        });
        return flag;
    }
    //judge log in info - login.js
const login = (data, socket) => {
    connectDB().then(dbObj => {
        return isRegister(dbObj, data.name);
    }).then(dbObj => {
        const userData = dbObj.result || [];
        if (userData.length > 0) {
            if (userData[0].password === data.password) {
                if (isLogin(data)) {
                    socket.emit('loginResult', { code: 2 });
                } else {
                    addOnlineUser(data, socket);
                    socket.emit('loginResult', { code: 3 });
                }
            } else {
                socket.emit('loginResult', { code: 1 });
            }
            dbObj.db.close();
        } else {
            socket.emit('loginResult', { code: 0 });
        }
    });
}

//judge register info - .js
const register = (data, socket) => {
    connectDB().then(dbObj => {
        return isRegister(dbObj, data.name);
    }).then(dbObj => {
        const userData = dbObj.result || [];
        if (userData.length > 0) {
            socket.emit('registerResult', { code: 0 });
            dbObj.db.close();
        } else {
            addUser(dbObj, data).then(resolve => {
                socket.emit('registerResult', { code: 1 });
                dbObj.db.close();
            })
        }
    });
}