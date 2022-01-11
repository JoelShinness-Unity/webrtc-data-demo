type UserIdMessage = { userId: string };
type RoomIdMessage = { roomId: string };
type DescriptionMessage = UserIdMessage & {description: RTCSessionDescriptionInit};
type CandidateMessage = UserIdMessage & {candidate:RTCIceCandidate};

export type CurrentUsersMessage = {
  type: 'CURRENT_USERS',
  userIds: string[]
};

export type ConnectedMessage = {
  type: 'CONNECTED',
} & UserIdMessage & RoomIdMessage;

export type NewUserMessage = {
  type: 'NEW_USER',
} & UserIdMessage;

export type RemoveUserMessage = {
  type: 'REMOVE_USER'
} & UserIdMessage;

export type ReceiveAnswerMessage = {
  type: 'RECEIVE_ANSWER', 
} & DescriptionMessage;

export type ReceiveOfferMessage = {
  type: 'RECEIVE_OFFER'
} & DescriptionMessage;

export type ReceiveCandidateMessage = {
  type: 'RECEIVE_CANDIDATE',
} & CandidateMessage;

export type IncomingMessage =
  | CurrentUsersMessage
  | ConnectedMessage
  | NewUserMessage
  | RemoveUserMessage
  | ReceiveAnswerMessage
  | ReceiveOfferMessage
  | ReceiveCandidateMessage

export type SendOfferMessage = {
  type: 'OFFER',
} & DescriptionMessage;

export type SendAnswerMessage = {
  type: 'ANSWER',
} & DescriptionMessage;

export type SendCandidateMessage = {
  type: 'CANDIDATE',
} & CandidateMessage;

export type OutgoingMessage = 
| SendOfferMessage
| SendAnswerMessage
| SendCandidateMessage;
