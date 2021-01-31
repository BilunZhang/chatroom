const BASE_URL = 'http://127.0.0.1:3000';
const socket = io.connect(BASE_URL);
const register = () => {
    const name = $('#register_name').val().trim();
    const password = $('#register_password').val();
    if (name && password) socket.emit('register', { name, password });
    else alert('Please enter your user name and password！')
    socket.on('registerResult', (data) => {
        if (data.code === 0) {
            alert('The user has alraedy signed up！');
            window.location.href = '/register'
        } else if (data.code === 1) {
            alert('You have signed up successfully！');
            window.location.href = '/'
        }
    })
}