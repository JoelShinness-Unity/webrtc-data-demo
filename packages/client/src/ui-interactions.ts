const userList = document.getElementById('user-list');

export function addNewUser(userId){
  const newItem = document.createElement('li');
  newItem.innerText = userId;
  newItem.setAttribute('data-user', userId);
  userList.appendChild(newItem);
}

export function removeUser(userId){
  const foundItem = userList.querySelector('li[data-user=' + userId + ']');
  if(foundItem) { foundItem.remove(); }
}

export function setUserId(userId){
  document.getElementById('user-id').innerHTML = userId;
}
