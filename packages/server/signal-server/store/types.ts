export type RoomId = string;
export type UserId = string;
export type User = {};
export type Room = {users:{[userId:UserId]:User}}

export type SignalServerState = {
  rooms: {[roomId:RoomId]:Room},
};

export type EstablishRoomAction = {
  type: 'ESTABLISH_ROOM',
  roomId: RoomId
};

export type AddUserAction = {
  type: 'ADD_USER',
  roomId: RoomId,
  userId: UserId,
}

export type RemoveUserAction = {
  type: 'REMOVE_USER',
  roomId: RoomId,
  userId: UserId
}

export type RemoveRoomAction = {
  type: 'REMOVE_ROOM',
  roomId: RoomId
}

export type SignalServerAction = 
  | EstablishRoomAction 
  | AddUserAction 
  | RemoveUserAction 
  | RemoveRoomAction;
