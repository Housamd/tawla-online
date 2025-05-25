const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let players = {};
let gameState = {
  turn: null,
  dice: [],
};

io.on('connection', (socket) => {
  console.log('لاعب متصل:', socket.id);

  socket.on('joinGame', (username) => {
    if (Object.keys(players).length < 2) {
      players[socket.id] = username;
      socket.emit('joined', { id: socket.id, username, players });
      io.emit('playersUpdate', players);

      if (Object.keys(players).length === 2) {
        const ids = Object.keys(players);
        gameState.turn = ids[Math.floor(Math.random() * 2)];
        io.emit('startGame', { turn: gameState.turn });
      }
    } else {
      socket.emit('roomFull');
    }
  });

  socket.on('move', (data) => {
    socket.broadcast.emit('opponentMove', data);
  });

  socket.on('rollDice', () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    gameState.dice = [d1, d2];
    io.emit('diceRolled', { dice: [d1, d2], turn: gameState.turn });
  });

  socket.on('endTurn', () => {
    const ids = Object.keys(players);
    gameState.turn = ids.find(id => id !== gameState.turn);
    io.emit('turnChanged', gameState.turn);
  });

  socket.on('disconnect', () => {
    console.log('لاعب قطع الاتصال:', socket.id);
    delete players[socket.id];
    io.emit('playersUpdate', players);
    io.emit('playerLeft');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`خادم اللعبة يعمل على المنفذ ${PORT}`);
});
