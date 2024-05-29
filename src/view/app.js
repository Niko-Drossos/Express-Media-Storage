(function () {
  const messages = document.getElementById('messages');
  const wsOpen = document.getElementById('ws_open');
  const wsClose = document.getElementById('ws_close');
  const wsInput = document.getElementById('ws_input');
  const wsSend = document.getElementById('ws_send');
  let ws

  function showMessage(message) {
    if (!messages) return
    messages.textContent += message + '\n';

  }

  wsOpen.addEventListener('click', () => {
    console.log("works")
    if (!!ws) {
      ws.close();
    }

    ws = new WebSocket('ws://localhost:3000');
    
    ws.addEventListener('error', () => {
      showMessage("Websocket error");
    });
    
    ws.addEventListener('open', () => {
      showMessage("Websocket open");
    });
    
    ws.addEventListener('close', () => {
      showMessage("Websocket closed");
    });
    
    ws.addEventListener('message', (event) => {
      showMessage(`Received: ${event.data}`);
    });
  });

  wsClose.addEventListener('click', () => {
    ws.close();
  });

  wsSend.addEventListener('click', () => {
    const val = wsInput?.value

    if (!val) {
      return
    } else if (!ws) {
      showMessage("Websocket not connected");
      return
    }

    ws.send(val)
    showMessage(`Sent: ${val}`);
    wsInput.value = ''
  })
})()