export type RoomId = string;
export type UserId = string;
export type User = Record<string, never>;

export type Room = {
  users:{[userId:UserId]:User},
}

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

export type MakeOfferAction = {
  type: 'MAKE_OFFER',
  roomId: RoomId,
  localUserId: UserId,
  remoteUserId: UserId,
  description:RTCSessionDescriptionInit
}

export type MakeAnswerAction = {
  type: 'MAKE_ANSWER',
  roomId: RoomId,
  localUserId: UserId,
  remoteUserId: UserId,
  description:RTCSessionDescriptionInit
}

export type AddIceCandidateAction = {
  type: 'ADD_ICE_CANDIDATE',
  roomId: RoomId,
  localUserId: UserId,
  remoteUserId: UserId,
  candidate: RTCIceCandidate,
};

export type SignalServerAction = 
  | EstablishRoomAction 
  | AddUserAction 
  | RemoveUserAction 
  | MakeOfferAction
  | MakeAnswerAction
  | AddIceCandidateAction;

