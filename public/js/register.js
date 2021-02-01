const BASE_URL = 'http://127.0.0.1:3000';
const socket = io.connect(BASE_URL);
const register = () => {
    const user_name = $('#register_name').val().trim();
    const user_pass = $('#register_password').val();
    if (user_name && user_pass) socket.emit('register', { user_name, user_pass });
    else alert('Please enter your user name and password！')
    socket.on('registerResult', (data) => {
        if (data.code === 0) {
            alert('The user has already signed up！');
            window.location.href = '/register'
        } else if (data.code === 1) {
            alert('You have signed up successfully！');
            window.location.href = '/'
        }
    })
}