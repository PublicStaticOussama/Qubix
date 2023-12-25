const ws = new WebSocket('ws://localhost:8123');

ws.onopen = () => {
    console.log('WebSocket connection opened');
    const subscription = {
        action: 'subscribe',
        channel_name: "training",
        actor: "consumer",
        message: "pls"
    }
    ws.send(JSON.stringify(subscription));

    const message = {
        action: 'consume',
        channel_name: "training",
        message: "pls"
    }
    ws.send(JSON.stringify(message));
};

ws.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);

    // Sleep for 5 seconds
    setTimeout(() => {
        console.log('Woke up from sleep');
        const message = {
            action: 'ack',
            channel_name: "training",
            message: JSON.stringify(event.data)
        }
        ws.send(JSON.stringify(message));
        console.log("ack sent");
    }, 3000);
};
