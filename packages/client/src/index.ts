

const ws = new WebSocket('ws://localhost:3000?room-id=abcd');

ws.addEventListener('open', (e) => {
  console.log('Open!', e);

  const userList = document.getElementById('user-list');
  function addNewUser(userId){
    const newItem = document.createElement('li');
    newItem.innerText = userId;
    newItem.setAttribute('data-user', userId);
    userList.appendChild(newItem);
  }
  function removeUser(userId){
    const foundItem = userList.querySelector('li[data-user=' + userId + ']');
    if(foundItem) { foundItem.remove(); }
  }
  ws.addEventListener('message', (e) => {
    console.log('Message!', e);
    try {
      const item = JSON.parse(e.data);
      switch(item.type){
      case 'CONNECTED': {
        document.getElementById('user-id').innerHTML = item.userId;
        break;
      }
      case 'NEW_USER': {
        addNewUser(item.userId);
        break;
      }
      case 'CURRENT_USERS': {
        item.userIds.forEach(addNewUser);
        break;
      }
      case 'REMOVE_USER': {
        removeUser(item.userId);
        break;
      }
      }
    } catch(e){ /* */ }
  });
});
