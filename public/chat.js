const API_REGISTER  = '/user/api/register';
const API_LOGIN = '/user/api/login';
const API_USER = '/user/api/users';


const loadUsers = async function() {
  console.log("Construction dynamique de la balise select")
  //const user = JSON.parse(localStorage.getItem('user'));
  const userConnected = localStorage.getItem('userConnected');
  console.log("loadUsers#user", userConnected)
  const res = await fetch(`${API_USER}?user_exclude=${userConnected}` );
  const users = await res.json();

  console.log("Users", users)

  const select = document.getElementById('userSelect');
  select.innerHTML = '';

  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user._id;
    option.textContent = user.username;
    select.appendChild(option);
  });
}

const saveUser = async function(username, password) {
  try {
    const response = await fetch(API_REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({              
        username: username,
        password: password
      })
    });
    const data = await response.json();
    console.log('Enrgeistrement reussi :', data);
    window.location.href = '/userloggin.html'
  } catch(error){
    console.log('Erreur', error);
  }
};

const loggin = async function(username, password){
  try{
    const response = await fetch(API_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({              
        username: username,
        password: password
      })
    });
    const data = await response.json();
    console.log('Enrgeistrement reussi :', data);
    
    
    console.log("username", username);

    localStorage.setItem('userConnected', username);
    localStorage.setItem('token', data.token);
    
    window.location.href = '/main.html';
  }catch(error){
    console.log('Erreur', error);
  }
};

const socket = io();
let login = document.getElementById("login")
login.onclick = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    loggin(username,password)

};




  let register = document.getElementById("register")
  register.onclick = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    saveUser(username, password);
  };




  const messages = document.getElementById("messages");



  let send = document.getElementById("send")
  send.onclick = () => {
    const text = document.getElementById("msg").value;


  };

  

