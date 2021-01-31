const url = decodeURI(location.href).split('?')[1].split('&');
//finding HTML elements by class name
const chatContent = document.getElementsByClassName('chat-content')[0];
const editBox = document.getElementsByClassName('edit-box')[0];
const editButton = document.getElementsByClassName('edit-button')[0];
const userName = document.getElementsByClassName('user-name')[0];
const logOut = document.getElementsByClassName('log-out')[0];
//connext socket.io 
const socket = io.connect('http://127.0.0.1:3000');

$.get('/getUser', res => {
    let users = ''
    res.userArr.forEach(item => {
        users += item + '<br/><br/>'
    })
    userName.innerHTML = users;
})
editButton.addEventListener('click', sendMessage);
logOut.addEventListener('click', logout);
document.onkeydown = function(event) {
    const e = event || window.event;
    if (e && e.keyCode === 13) {
        if (editBox.value !== '') {
            editButton.click();
        }
    }
};

function logout() {
    socket.emit('logout', url[0].split('=')[1]);
    window.location.href = '/'
}

socket.on('message', function(information) {
    if (information.name !== url[0].split('=')[1]) {
        createOtherMessage(information);
    }
});
socket.on('userChange', function(data) {
    let users = ''
    data.forEach(item => {
        users += item + '<br/><br/>'
    })
    userName.innerHTML = users;
});

function sendMessage() {
    if (editBox.value !== '') {
        const myInformation = {
            name: url[0].split('=')[1],
            message: editBox.value
        };
        socket.emit('message', myInformation);
        createMyMessage();
        editBox.value = '';
    }

}

function createMyMessage() {
    var myMessageBox = document.createElement('div');
    myMessageBox.className = 'my-message-box';

    var messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    var text = document.createElement('span');
    text.innerHTML = editBox.value;
    messageContent.appendChild(text);
    myMessageBox.appendChild(messageContent);

    var arrow = document.createElement('div')
    arrow.className = 'message-arrow';
    myMessageBox.appendChild(arrow);

    var userInformation = document.createElement('div');
    userInformation.className = 'user-information';
    var userChatName = document.createElement('div');
    const userChatTime = document.createElement('span');
    userChatName.className = 'user-chat-name';
    userChatName.innerHTML = `<span class="user-chat-time">${getCurrentTime()}</span><br/>` + url[0].split('=')[1];
    userInformation.appendChild(userChatName);
    myMessageBox.appendChild(userInformation);
    chatContent.appendChild(myMessageBox);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function createOtherMessage(information) {
    const otherMessageBox = document.createElement('div');
    otherMessageBox.className = 'other-message-box';
    const otherUserInformation = document.createElement('div');
    otherUserInformation.className = 'other-user-information';
    const userChatTime = document.createElement('span');
    userChatTime.className = 'user-chat-time';
    userChatTime.innerHTML = getCurrentTime();
    otherUserInformation.appendChild(userChatTime);
    const userChatName = document.createElement('span');
    userChatName.className = 'user-chat-name';
    userChatName.innerHTML = information.name;
    otherUserInformation.appendChild(userChatName);
    otherMessageBox.appendChild(otherUserInformation);
    const otherMessageArrow = document.createElement('div');
    otherMessageArrow.className = 'other-message-arrow';
    otherMessageBox.appendChild(otherMessageArrow);
    const otherMessageContent = document.createElement('div');
    otherMessageContent.className = 'other-message-content';
    const text = document.createElement('span');
    text.innerHTML = information.message;
    otherMessageContent.appendChild(text);
    otherMessageBox.appendChild(otherMessageContent);
    chatContent.appendChild(otherMessageBox);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function getCurrentTime() {
    const date = new Date().toLocaleString()
    return date;
}