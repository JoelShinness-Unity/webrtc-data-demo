import produce from 'immer';
import { 
  SignalServerState, 
  AddUserAction, 
  RemoveUserAction, 
  EstablishRoomAction, 
  RemoveRoomAction 
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
    delete draft.rooms[roomId].users[userId];
  });
}

export function removeRoom(state:SignalServerState, action:RemoveRoomAction):SignalServerState{
  const {roomId} = action;
  if(!state.rooms[roomId]) return state;
  return produce(state, draft => {
    delete draft.rooms[roomId];
  });
}
