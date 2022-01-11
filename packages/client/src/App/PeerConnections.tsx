import React, { useEffect, useRef, useState } from 'react';
import { filter, from, fromEvent, map, mergeMap, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { 
  SendCandidateMessage, 
  IncomingMessage, 
  OutgoingMessage, 
  ReceiveAnswerMessage, 
  ReceiveOfferMessage, 
  ReceiveCandidateMessage 
} from '../types';
import { User } from './types';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

type PeerConnectionProps = {
  user: User,
  userMessage$: Observable<IncomingMessage & {userId: string}>,
  onMsg(msg:OutgoingMessage):void,
  localAudioStream?:MediaStream
};

function callerPC$(pc:RTCPeerConnection, makeOffer:(description:RTCSessionDescriptionInit) => void, getAnswer:Observable<RTCSessionDescriptionInit>):Observable<unknown>{
  return from(pc.createOffer({offerToReceiveAudio: true})).pipe(
    tap((d) => pc.setLocalDescription(d)),
    tap(makeOffer),
    mergeMap(():Observable<RTCSessionDescriptionInit> => getAnswer),
    tap((d:RTCSessionDescriptionInit) => pc.setRemoteDescription(d))
  );
}

function calleePC$(pc:RTCPeerConnection, getOffer:Observable<RTCSessionDescriptionInit>, makeAnswer:(description:RTCSessionDescriptionInit) => void):Observable<unknown>{
  return getOffer.pipe(
    tap((d:RTCSessionDescriptionInit) => pc.setRemoteDescription(d)),
    mergeMap(() => from(pc.createAnswer())),
    tap((d) => pc.setLocalDescription(d)),
    tap(makeAnswer)
  );
}

function PeerConnection({user, userMessage$, onMsg, localAudioStream}:PeerConnectionProps){
  const [pc] = useState<RTCPeerConnection>(() => new RTCPeerConnection(servers));
  const audioElement = useRef<HTMLAudioElement>();
  const [remoteAudioStream] = useState<MediaStream>(() => new MediaStream());

  useEffect(() => {
    localAudioStream && localAudioStream.getTracks().forEach(track => { pc.addTrack(track); });
  }, [localAudioStream]);
  
  useEffect(() => {
    audioElement.current.srcObject = remoteAudioStream;
    const close$ = new Subject<true>();

    // When I generate an ICE Candidate, I send it to the server
    fromEvent<RTCPeerConnectionIceEvent>(pc, 'icecandidate').pipe(
      filter(({candidate}) => candidate != null),
      map(({candidate}):SendCandidateMessage => ({type: 'CANDIDATE', candidate, userId: user.userId})),
      takeUntil(close$),
    ).subscribe(onMsg);
    
    // When I get an ICE candidate, I add it to my peerconnection
    userMessage$.pipe(
      filter((msg):msg is ReceiveCandidateMessage => msg.type === 'RECEIVE_CANDIDATE'),
      takeUntil(close$),
    ).subscribe(({candidate}) => { pc.addIceCandidate(candidate); });

    // Define receiveDataChannel first
    const receiveDataChannel = pc.createDataChannel('vani');
    fromEvent(receiveDataChannel, 'message').pipe(takeUntil(close$)).subscribe((e) => console.log('DataChannel Message (dc)', e));

    // Either make an offer and wait for an answer OR wait for an offer and make an answer
    const allSetUp$:Observable<unknown> = user.initial ? callerPC$(
      pc, 
      description => { onMsg({type: 'OFFER', userId: user.userId, description }); },         
      userMessage$.pipe(
        filter((msg):msg is ReceiveAnswerMessage => msg.type === 'RECEIVE_ANSWER'),
        map(({description}) => description)
      )
    ) : calleePC$(
      pc,
      userMessage$.pipe(
        filter((msg):msg is ReceiveOfferMessage => msg.type === 'RECEIVE_OFFER'),
        map(({description}) => description)
      ),
      description => { onMsg({type: 'ANSWER', userId: user.userId, description}); }
    );
    
    // Wait to get the sending data channel, then send "hi"
    fromEvent<RTCDataChannelEvent>(pc, 'datachannel').pipe(
      takeUntil(close$),
    ).subscribe((e) => { e.channel.send(`Hi to ${user.userId}`); });
    
    allSetUp$.pipe(
      mergeMap(() => fromEvent(pc, 'connectionstatechange').pipe(
        map(() => pc.connectionState),
        filter(cs => cs === 'connected'),
        take(1)
      )),
      takeUntil(close$),
    ).subscribe(() => { console.log('Connected!'); });

    // fromEvent<RTCTrackEvent>(pc, 'track')
    //   .pipe(takeUntil(close$))
    //   .subscribe(e => { 
    //     remoteAudioStream.addTrack(e.track);
    //   });

    close$.pipe(take(1)).subscribe(() => pc.close());

    return () => { close$.next(true); };
  }, []);
  return <audio autoPlay ref={audioElement}/>;
}

export type PeerConnectionsProps = {
  users: User[];
  incomingMessage$:Observable<IncomingMessage>;
  onMsg(msg:OutgoingMessage):void;
  localAudioStream?:MediaStream
}

export function PeerConnections({users,incomingMessage$, onMsg, localAudioStream}:PeerConnectionsProps){

  return <>
    {users.map(user => (
      <PeerConnection
        key={user.userId}
        user={user} 
        userMessage$={incomingMessage$.pipe(
          filter((msg:IncomingMessage): msg is IncomingMessage & {userId: string} => 'userId' in msg && msg.userId === user.userId),
        )}
        onMsg={onMsg}
        localAudioStream={localAudioStream}
      />
    ))}
  </>;
}