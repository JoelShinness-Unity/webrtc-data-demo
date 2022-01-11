import React, { useEffect, useState } from 'react';
import { incomingMessage$, outgoingMessage$ } from '../ws-handler';
import produce from 'immer';
import { PeerConnections } from './PeerConnections';

export function App(){
  const [userId, setUserId] = useState<string|undefined>();
  const [users, setUsers] = useState<{userId:string, initial: boolean}[]>([]);
  const [audioStream, setAudioStream] = useState<MediaStream|undefined>();
  
  useEffect(() => {
    const sub = incomingMessage$.subscribe(msg => {
      switch(msg.type){
        case 'CONNECTED': {
          setUserId(msg.userId); break;
        }
        case 'NEW_USER': {
          setUsers(userIds => [...userIds, {userId: msg.userId, initial: false}]);
          break;
        }
        case 'CURRENT_USERS': {
          setUsers(msg.userIds.map(userId => ({userId, initial: true})));
          break;
        }
        case 'REMOVE_USER': {
          setUsers(userIds => produce(userIds, draft => {
            const index = draft.findIndex(user => user.userId === msg.userId);
            if(index >= 0) draft.splice(index, 1);
          }));
        }
      }
    });
    navigator.mediaDevices.getUserMedia({audio: true}).then(setAudioStream);
    return () => sub.unsubscribe();
  }, []);

  return <div className="container">
    <h1>Websocket Demo</h1>
    <h2>User Id: {userId === undefined ? <em>Not Found</em> : userId}</h2>
    <ul id="user-list">
      {users.map(({userId}) => <li key={userId}>{userId}</li>)}
    </ul>
    <PeerConnections 
      users={users} 
      incomingMessage$={incomingMessage$} 
      onMsg={msg => outgoingMessage$.next(msg)}
      localAudioStream={audioStream}
    />
  </div>;
}