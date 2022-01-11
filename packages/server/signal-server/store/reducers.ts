import produce from 'immer';
import { 
  SignalServerState, 
  AddUserAction, 
  RemoveUserAction, 
  EstablishRoomAction, 
} from './types';

export function establishRoom(state:SignalServerState, action:EstablishRoomAction):SignalServerState{
  const {roomId} = action;
  if(state.rooms[roomId]) return state;
  return produce(state, draft => {
    draft.rooms[roomId] = {users:{}};
  });
}

export function addUser(state:SignalServerState, action:AddUserAction):SignalServerState{
  const { roomId, userId } = action;
  const initialState = establishRoom(state, { roomId, type: 'ESTABLISH_ROOM'});
  if(initialState.rooms[roomId].users[userId]) return state;
  return produce(initialState, draft => {
    draft.rooms[roomId].users[userId] = {};
  });
}

export function removeUser(state: SignalServerState, action:RemoveUserAction):SignalServerState {
  const {roomId, userId} = action;

  if(!state.rooms[roomId] || !state.rooms[roomId].users[userId]) return state;
  return produce(state, draft => {
    const room = draft.rooms[roomId];
    delete room.users[userId];
  });
}

// export function removeRoom(state:SignalServerState, action:RemoveRoomAction):SignalServerState{
//   const {roomId} = action;
//   if(!state.rooms[roomId]) return state;
//   return produce(state, draft => {
//     delete draft.rooms[roomId];
//   });
// }

// export function makeOffer(state:SignalServerState, action:MakeOfferAction):SignalServerState{
//   const {roomId, localUserId, remoteUserId, description} = action;
//   const room = state.rooms[roomId];
//   if(!room) return state;
//   if(!room.users[localUserId] || !room.users[remoteUserId]) return state;
//   if(room.connections.some(connection => (connection.answerUserId === localUserId && connection.offerUserId === remoteUserId) || (connection.answerUserId === remoteUserId && connection.offerUserId === localUserId))) return state;
//   return produce(state, draft => {
//     draft.rooms[roomId].connections.push({
//       offerUserId: localUserId,
//       answerUserId: remoteUserId,
//       offer: description
//     });
//   });
// }

// export function makeAnswer(state:SignalServerState, action:MakeAnswerAction):SignalServerState{
//   const {roomId, localUserId, remoteUserId, description} = action;
//   return produce(state, draft => {
//     const room = draft.rooms[roomId];
//     if(!room) return;
//     const connection = room.connections.find(({offerUserId, answerUserId}) => {
//       return offerUserId === remoteUserId && answerUserId === localUserId;
//     });
//     if(!connection) return;
//     connection.answer = description;
//   });
// }