const BASE_URL = 'http://127.0.0.1:3000';
const socket = io.connect(BASE_URL);
const login = () => {
    const name = $('#login_name').val().trim();
    const password = $('#login_password').val();
    if (name && password) socket.emit('login', { name, password });
    else alert('Please enter your user name and password！')
    socket.on('loginResult', (data) => {
        if (data.code === 0) {
            alert('The user does not exist！');
            window.location.href = '/'
        } else if (data.code === 1) {
            alert('The password you’ve entered is incorrect！');
            window.location.href = '/'
        } else if (data.code === 2) {
            alert('The user has already logged in！');
            window.location.href = '/'
        } else if (data.code === 3) {
            alert('You have logged in successfully！');
            window.location.href = `/index?name=${name}`
        }
    })
}