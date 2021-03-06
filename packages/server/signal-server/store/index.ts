import { BehaviorSubject, scan, Subject, tap } from 'rxjs';
import { establishRoom, addUser, removeUser } from './reducers';
import { SignalServerState, SignalServerAction } from './types';

export function signalServerReducer(state:SignalServerState|undefined|null, action:SignalServerAction):SignalServerState {
  state = state || initialState;
  switch(action.type){
    case 'ESTABLISH_ROOM': return establishRoom(state, action);
    case 'ADD_USER': return addUser(state, action);
    case 'REMOVE_USER': return removeUser(state, action);
    default: return state;
  }
}

export const initialState:SignalServerState = {rooms:{}};

export const store$ = new BehaviorSubject<[SignalServerState, SignalServerAction|undefined]>([initialState, undefined]);
export const action$ = new Subject<SignalServerAction>();

action$.pipe(
  scan<SignalServerAction, [SignalServerState, SignalServerAction]>(([aggState], action) => [signalServerReducer(aggState, action), action], [initialState, undefined]),
  tap(([{rooms}, action]) => { console.log('Store', rooms, action);})
).subscribe(store$);
