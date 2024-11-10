/**
 * @type {HTMLButtonElement}
 */
const button = document.querySelector("#btn")

const ws = new WebSocket('ws://localhost:8123');
ws.onopen = () => {
    console.log('WebSocket connection opened');
    const subscription = {
        action: 'subscribe',
        channel_name: "training",
        actor: "publisher",
        message: "pls"
    }
    ws.send(JSON.stringify(subscription));
};

button.onclick = function() {
    const message = {
        action: 'publish',
        channel_name: "training",
        type: "string",
        message: "Hello, World!"
    }
    ws.send(JSON.stringify(message));
}