import { EMPTY, fromEvent, map, mergeMap, mergeMapTo, Observable, of, share, Subject, takeUntil } from 'rxjs';
import { IncomingMessage, OutgoingMessage } from './types';


type Open = ['open', Event];
type Msg = ['message', MessageEvent<unknown>];


export function createWs(outgoingMessages$:Observable<string>, url:string|URL, protocols?:string|string[]):Observable<Open|Msg>{
  return new Observable((observer) => {
    const ws = new WebSocket(url, protocols);
    const close$ = new Subject<true>();

    fromEvent(ws, 'close').pipe(takeUntil(close$)).subscribe(() => observer.complete());
    fromEvent(ws, 'error').pipe(takeUntil(close$)).subscribe(err => observer.error(err));
    fromEvent(ws, 'message').pipe(takeUntil(close$)).subscribe(msg => observer.next(['message', msg as MessageEvent<unknown>]));
    
    fromEvent(ws, 'open').pipe(takeUntil(close$)).subscribe(e => ['open', e]);
    fromEvent(ws, 'open').pipe(
      mergeMapTo(outgoingMessages$),
      takeUntil(close$)
    ).subscribe(message => ws.send(message));

    return () => {
      close$.next(true);
      ws.close();  
    };
  });
}

export const outgoingMessage$ = new Subject<OutgoingMessage>();

export const incomingMessage$ = createWs(outgoingMessage$.pipe(map(msg => JSON.stringify(msg))), 'ws://localhost:3000?room-id=abcd').pipe(
  mergeMap((ev) => {
    if(ev[0] !== 'message') return EMPTY;
    try {
      return of(JSON.parse(ev[1].data.toString()));
    }catch(e){ return EMPTY; }
  }),
  share()
) as Observable<IncomingMessage>;