//import json from "body-parser";
//import parse from "path";

const API_REGISTER  = '/user/api/register';
const API_LOGIN = '/user/api/login';
const API_USER = '/user/api/users';
const API_MESSAGE = '/message/api/messages';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
      console.log('Connected to server');
})

 socket.on('join', (user) => {
    socket.receiver = user;
    socket.join(user)
    console.log("socket#join#userId", user)
});

/*
socket.on('sendMessage', (data) => {
   console.log("\n>>>>> socket#sendMessage <<<<< \n");
  console.log("data sended", data);
  const messagesDiv = document.getElementById('messages');

  const divMsg = document.createElement('div');
  divMsg.classList.add('sender');
 
  divMsg.textContent = data.content;
  messagesDiv.appendChild(divMsg)
  //socket.emit("receiveMessage", data)
})
  */

socket.on('receiveMessage', (data) => {
  console.log("\n>>>>> socket#receiveMessage <<<<< \n");
  console.log("data received", data);

});

socket.on('sendMessage', (data) => {
  console.log("\n>>>>> socket#sendMessage <<<<< \n");
  console.log("data sended", data);

})

socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
  });


const loadUsers = async function() {
  const params = new URLSearchParams(window.location.search);
  console.log("params", params)
  const userConnected = localStorage.getItem('username');
  console.log("Construction dynamique de la balise select");

  console.log("loadUsers#user", userConnected);
  const res = await fetch(`${API_USER}?user_exclude=${userConnected}` );
  const users = await res.json();

  console.log("Users", users)

  const select = document.getElementById('userSelect');
  if(select){
      select.innerHTML = '';

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user._id;
      option.textContent = user.username;
      select.appendChild(option);
    });
  }



  let send_interlocutor = document.getElementById("send_interlocutor");

  if(send_interlocutor){
    send_interlocutor.addEventListener('click', () => {
      const params = new URLSearchParams(window.location.search);
      const userConnected = localStorage.getItem('username');

      const userSelect = document.getElementById("userSelect");
      interlocutorId = userSelect.value;
      const interlocutorUsername = userSelect.options[userSelect.selectedIndex].text;
      console.log(`{userId: ${interlocutorId}, usename : ${interlocutorUsername}}`)

      socket.emit("join", interlocutorId);

      window.location.href = `/conversation.html?recieverid=${interlocutorId}`;
    })
  }
}


const printInterlocutor = function(){
  const params = new URLSearchParams(window.location.search);
  const recieverid = params.get('recieverid');
  console.log('recieverid', recieverid)

  retrieveUserById(recieverid).then((receiver) => {
    console.log('receiver', receiver);
    document.getElementById('chatWith').textContent = receiver.username;
  });
  
}

const retrieveUser  = async function(username){
    // Requete
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_USER}/${username}`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    // Handle HTTP errors (e.g., 401 Unauthorized, 403 Forbidden)
    const errorData = await response.json();
    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
  }

  const user = await response.json();
  return user;
}

const retrieveUserById  = async function(userId){
    // Requete

  const token = localStorage.getItem("token");

  console.log('UserId in retrieveUserById',userId)

  const response = await fetch(`${API_USER}/byId/${userId}`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
      // Handle HTTP errors (e.g., 401 Unauthorized, 403 Forbidden)
    const errorData = await response.json();
    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
  }

  const user = await response.json();

  return user;
}

const sendMessage = async function(senderUsername, receiverId, contentMessage){
    // GET Sender && receiver
   const sender = await retrieveUser(senderUsername);
   const receiver = await retrieveUserById(receiverId);

   if(!sender){
    throw new Error(`Erreur : Sender with ${senderUsername} not exist !`);
   }

    if(!receiver){
      throw new Error(`Erreur : receiver with ${receiverUsername} not exist !`);
    }
    
    if(contentMessage.trim().length === 0){
       throw new Error(`Erreur : Message content is empty !`);
    }


    const token = localStorage.getItem("token")
    // Creation du message
    /*const response = await fetch(API_MESSAGE,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
       body: JSON.stringify({              
        sender: sender._id,
        receiver: receiver._id,
        content : contentMessage
      })
    });

     if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
    }
    */
    
    console.log("receive begin emit", receiver);

     socket.emit("sendMessage",{              
        sender: sender,
        receiver: receiver,
        content : contentMessage
      });

  console.log("Reponse create Message", await response.json());
}

const loadMessages = async function(){
    const messagesDiv = document.getElementById('messages');
    const senderUsername = localStorage.getItem("username");

    const params = new URLSearchParams(window.location.search);
     const recieverid = params.get('recieverid');

    const receiver = await retrieveUserById(recieverid)

    console.log('loadMessages#receiver', receiver);

    const token = localStorage.getItem("token")
    const response = await fetch(API_MESSAGE+ `?sender=${senderUsername}&receiver=${receiver.username}`,{
      method: 'GET',
       headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 401 Unauthorized, 403 Forbidden)
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
    }

    const messages = await response.json();
   
    console.log("messages", messages);

    messages.forEach(msg => {
        const divMsg = document.createElement('div');

         if(msg.sender.username===senderUsername){
            divMsg.classList.add('sender');
        }else{
            divMsg.classList.add('receiver');
        }

        divMsg.textContent = msg.content;
        messagesDiv.appendChild(divMsg)
    })
      
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
  console.log("login coté client")
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
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', username);

    loadMessages();
    window.location.href = `/main.html`;
  }catch(error){
    console.log('Erreur', error);
  }
};



const loginBtn = document.getElementById("login");

if(loginBtn) {
  loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  loggin(username,password);
});
}


  let register = document.getElementById("register")

  if(register){
    register.onclick = async () => {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      
      saveUser(username, password);
    };
  }

 // const messages = document.getElementById("messages");

const sendBtn = document.getElementById("send");

if(sendBtn){
  sendBtn.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const recieverid = params.get('recieverid');
    const senderUserName = localStorage.getItem("username")
    console.log("recieverid", recieverid);
    inputMsg = document.getElementById("msg")
    const text = inputMsg.value;
    console.log("message content", text);
   
    console.log(`senderUserName : ${senderUserName} , receverId : ${recieverid}`);
    
     sendMessage(senderUserName, recieverid,text).then( (response) => {
        console.log("succès", response);
     }).catch((err) => {
        console.log("Erreur", err);
     });

    inputMsg.value = '';

    //loadMessages()
});
}



loadUsers();

printInterlocutor()


  //const userConnected = localStorage.getItem('userConnected');
loadMessages();

  

