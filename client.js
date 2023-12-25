const WebSocket = require('ws');
const crypto = require('crypto');
const { log } = require('console');

/**
 * @typedef {Object} Body
 * @property {'consume' | 'publish' | 'ack' | 'subscribe' | 'purge'} action - 
 * @property {string} channel_name - The Y Coordinate
 * @property {string} message - The Y Coordinate
 * @property {"publisher" | "consumer"} actor - The Y Coordinate
 */

// Create a global queue array
const channel_queues = {} // queues
const unack_consumers = {} 
const clients = {}
const publishers = {}


function addUnAckMessage(channel_name, client_id, message) {
    if (!(channel_name in unack_consumers)) {
        unack_consumers[channel_name] = {}
    }
    if (!(client_id in unack_consumers[channel_name])) {
        unack_consumers[channel_name][client_id] = []
    }
    unack_consumers[channel_name][client_id].push(message)
}

function enqueueChannel(channel_name, message) {
    if (!(channel_name in channel_queues)) {
        channel_queues[channel_name] = []
    }
    channel_queues[channel_name].push(message)
}

function dequeueAndSend(channel_name, client_id) {
    const message = channel_queues[channel_name].shift();
    // /** @type {Body} */
    // const tail = {
    //     action: "publish",
    //     channel_name: channel_name,
    //     message: message // unecessary but just to make sure
    // }
    // clients[client_id].send(JSON.stringify(tail))
    clients[client_id].send(message)
    return message
}

function sendToConsumer(channel_name, client_id, message) {
    // /** @type {Body} */
    // const body = {
    //     action: "publish",
    //     channel_name: channel_name,
    //     message: message // unecessary but just to make sure
    // }

    // clients[client_id].send(JSON.stringify(body))
    clients[client_id].send(message)
    return message
}

function ackMessage(channel_name, client_id) {
    if (channel_name in unack_consumers && client_id in unack_consumers[channel_name]) {
        // console.log("BEFORE ACK:", unack_consumers[client_id].length);
        const unack_message = unack_consumers[channel_name][client_id].shift() // TODO: unack_consumers should be channel specific
        // console.log("AFTER ACK:", unack_consumers[client_id].length);
        return unack_message
    }
    return null
}

// Create a WebSocket server instance
const wss = new WebSocket.Server({ port: 8123 });

// Listen for WebSocket connections
wss.on('connection', (ws) => {
//   console.log('Client connected');
  const id = crypto.randomBytes(8).toString("hex");
//   clients.set(ws, id);
  clients[id] = ws
//   unack_consumers[id] = []
  ws.id = id

  console.log(ws.id)

  ws.on('message', (message) => {
    /** @type {Body} */
    const body = JSON.parse(message)

    const channel_name = body.channel_name
    switch(body.action) {
        case "heartbeat":
            console.log("heartbeat from:", ws.id)
            break;
        case "purge":
            if(channel_name in unack_consumers) {
                for(const client_id in unack_consumers[channel_name]) {
                    unack_consumers[channel_name][client_id] = []
                }
            }
            channel_queues[channel_name] = []
            break;
        case "subscribe":
            if (body.actor == 'consumer') {
                if (!(channel_name in unack_consumers)) {
                    unack_consumers[channel_name] = {}
                }
                unack_consumers[channel_name][ws.id] = []
                console.log(`consumer ${ws.id} subscribed to`, unack_consumers)
                if (!(channel_name in channel_queues)) {
                    channel_queues[channel_name] = []
                } else {
                    if((!(ws.id in unack_consumers[channel_name]) || unack_consumers[channel_name][ws.id].length == 0) && channel_queues[channel_name].length) { //qos
                        const message = dequeueAndSend(channel_name, ws.id)
                        addUnAckMessage(channel_name, ws.id, message)
                    }
                }
            } else {
                console.log(`publishers ${ws.id} subscribed to`, unack_consumers)
                publishers[ws.id] = true
            }
            break;
        case "ack":
            // console.log("ack id:", ws.id);
            const old_message = ackMessage(channel_name, ws.id)
            if (channel_queues[channel_name].length) {
                if((!(ws.id in unack_consumers[channel_name]) || unack_consumers[channel_name][ws.id].length == 0) && channel_queues[channel_name].length) {
                    const message = dequeueAndSend(channel_name, ws.id)
                    addUnAckMessage(channel_name, ws.id, message)
                }
            }
            // console.log("=> after ack: unack:", unack_consumers[channel_name][ws.id].length, "channel queue", channel_queues[channel_name].length);

            break;
        case "publish":
            // console.log('recieved a publish !!!!', body.message)
            // console.log("occupied consumers", channel_queues);
            // console.log("helloooooo ?????", unack_consumers);
            let free_consumer_id = null
            for (const id in unack_consumers[channel_name]) {
                // console.log("helloooooo ?????", unack_consumers[channel_name][id].length, id != ws.id);
                if ((!unack_consumers[channel_name][id] || !unack_consumers[channel_name][id].length) && id != ws.id && !(id in publishers)) {
                    free_consumer_id = id
                }
            }
            // console.log('publisher id:', ws.id)
            // console.log('free consumer ???', free_consumer_id)
            if (free_consumer_id) {
                const message = sendToConsumer(channel_name, free_consumer_id, body.message)
                addUnAckMessage(channel_name, free_consumer_id, message)
            } else {
                enqueueChannel(channel_name, body.message)
            }
            break;
        case "consume":
            console.log("conusme");
            if (!(channel_name in channel_queues)) {
                channel_queues[channel_name] = []
            } else {
                if((!(ws.id in unack_consumers[channel_name]) || unack_consumers[channel_name][ws.id].length == 0) && channel_queues[channel_name].length)  { //qos
                    const message = dequeueAndSend(channel_name, ws.id)
                    addUnAckMessage(channel_name, ws.id, message)
                }
            }
            break;
    }
  });

  // Listen for WebSocket disconnections
  ws.on('close', () => {
    console.log(`Client ${ws.id} disconnected !!!`);
    // clients.delete(ws);
  });
});


