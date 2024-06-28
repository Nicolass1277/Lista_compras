const baseUrl = 'http://localhost:3000';

// Maneja el formulario de registro
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message); 
}); 

// Maneja el formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Inicio de sesión exitoso');
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});

// Maneja la solicitud de información del usuario
document.getElementById('getUserInfo').addEventListener('click', async function() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseUrl}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.textContent = JSON.stringify(data, null, 2);
});