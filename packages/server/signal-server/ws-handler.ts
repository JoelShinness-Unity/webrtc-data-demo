import { Request } from 'express';
import { EMPTY, endWith, fromEvent, map, merge, mergeMap, Observable, of, skipWhile, startWith, take, takeUntil } from 'rxjs';
import { WebSocket } from 'ws';
import { action$, store$ } from './store';
import { 
  AddIceCandidateAction, 
  MakeAnswerAction, 
  MakeOfferAction, 
  SignalServerAction 
} from './store/types';
import { makeId } from './utils';

export function wsHandler(ws:WebSocket, request:Request){
  const userId = makeId();
  const roomId = request.query['room-id'] as string;

  const closeEvent$ = merge(
    fromEvent(ws, 'close'), 
    fromEvent(ws, 'error')
  ).pipe(take(1));
  const firstAction:SignalServerAction = {type: 'ADD_USER', userId, roomId};

  const outgoingMessage$:Observable<string> = store$.pipe(
    takeUntil(closeEvent$),
    skipWhile(([,action]) => action !== firstAction),
    mergeMap(([state, action]) => {
      if('roomId' in action && action.roomId !== roomId) return EMPTY;

      if(action === firstAction){
        return of({
          type: 'CURRENT_USERS',
          userIds: Object.keys(state.rooms[roomId].users).filter(u => u !== userId)
        });
      }
      switch(action.type){
        case 'ADD_USER': return of({type: 'NEW_USER', userId: action.userId});
        case 'REMOVE_USER': return of({type: 'REMOVE_USER', userId: action.userId});
        case 'MAKE_OFFER': {
          if(action.remoteUserId === userId){
            return of({type: 'RECEIVE_OFFER', userId: action.localUserId, description: action.description});
          }
          return EMPTY;
        }
        case 'MAKE_ANSWER': {
          if(action.remoteUserId === userId){
            return of({type: 'RECEIVE_ANSWER', userId: action.localUserId, description: action.description});
          }
          return EMPTY;
        }
        case 'ADD_ICE_CANDIDATE': {
          if(action.remoteUserId === userId){
            return of({type: 'RECEIVE_CANDIDATE', userId: action.localUserId, candidate: action.candidate});
          }
          return EMPTY;
        }
        default: return EMPTY;
      }
    }),
    startWith({type: 'CONNECTED', roomId, userId}),
    map(msg => typeof msg === 'string' ? msg : JSON.stringify(msg)),
  );
  outgoingMessage$.subscribe(msg => ws.send(msg));

  // Take incoming messages and create actions based on them.
  const incomingMessage$ = fromEvent(ws, 'message') as Observable<MessageEvent>;

  const incomingAction$:Observable<SignalServerAction> = incomingMessage$.pipe(
    mergeMap<MessageEvent, Observable<SignalServerAction>>((msg) => {
      try {
        const msgObj = JSON.parse(msg.data.toString());
        switch(msgObj.type){
          case 'OFFER': {
            if(!('userId' in msgObj) || !('description' in msgObj)) return EMPTY;
            return of<MakeOfferAction>({
              type: 'MAKE_OFFER', 
              roomId, 
              remoteUserId: msgObj.userId, 
              localUserId: userId,
              description: msgObj.description
            });
          }
          case 'ANSWER': {
            if(!('userId' in msgObj) || !('description' in msgObj)) return EMPTY;
            return of<MakeAnswerAction>({
              type: 'MAKE_ANSWER', 
              roomId, 
              remoteUserId: msgObj.userId, 
              localUserId: userId,
              description: msgObj.description
            });
          }
          case 'CANDIDATE': {
            if(!('userId' in msgObj) || !('candidate' in msgObj)) return EMPTY;
            return of<AddIceCandidateAction>({
              type: 'ADD_ICE_CANDIDATE',
              roomId,
              localUserId: userId,
              remoteUserId: msgObj.userId,
              candidate: msgObj.candidate
            });
          }
        }
      } catch(e){/* */}
      return EMPTY;
    }),
    takeUntil(closeEvent$),
    startWith<SignalServerAction>(firstAction),
    endWith<SignalServerAction>({type: 'REMOVE_USER', userId, roomId}),
  );

  incomingAction$.subscribe({
    next(x) { action$.next(x); }
  });
}