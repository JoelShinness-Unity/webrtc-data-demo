# WebRTC Audio Game

## Purpose

Demonstrate using WebRTC Data to send realtime data over a Peer Connection

## Quick Start

This app uses [Lerna](https://lerna.js.org/) to manage multiple JavaScript projects. Install with `npm i -g lerna`.

* Install dependencies: `lerna bootstrap`
* Run server and client: `lerna run --parallel watch`

> Note client is available at https://localhost:1234

# Goals

* [X] Make simple WS "room"-based signal server
* [X] Make WebRTC connection in room with Audio and Data
* [ ] Send voice energy data
* [ ] Send positional data
* [ ] Make simple game to show position and voice energy
