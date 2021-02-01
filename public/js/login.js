const BASE_URL = 'http://127.0.0.1:3000';
const socket = io.connect(BASE_URL);
const login = () => {
    const user_name = $('#login_name').val().trim();
    const user_pass = $('#login_password').val();
    if (user_name && user_pass) socket.emit('login', { user_name, user_pass });
    else alert('Please enter your user name and password！')
    socket.on('loginResult', (data) => {
        if (data.code === 0) {
            alert('The user does not exist！');
            window.location.href = '/'
        } else if (data.code === 1) {
            alert('The password you have entered is incorrect！');
            window.location.href = '/'
        } else if (data.code === 2) {
            alert('The user has already logged in！');
            window.location.href = '/'
        } else if (data.code === 3) {
            alert('You have logged in successfully！');
            window.location.href = `/index?name=${user_name}`
        }
    })
}