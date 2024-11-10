function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Consumer {
    constructor(host, port) {
        this.host = host
        this.port = port
        this.isOpen = false
        this.broker = new WebSocket(`ws://${this.host}:${this.port}`);
        this.subscribed_channel = null
        this.ack_required = false
    }

    async openConnection(timeout=15) {
        this.broker.onopen = () => {
            this.isOpen = true
        };
        await delay(timeout)
        console.log('broker connection is:', this.isOpen)
    }

    subscribe(channel_name) {
        this.subscribed_channel = channel_name ? channel_name : null
        if (!this.isOpen) throw new Error("[Qubix] Error: borker connection is not open, call consumer.openConnection() to establish connection !!")
        if (!this.subscribed_channel) throw new Error("[Qubix] Error: channel provided is invalid !!")
        const subscription_packet = {
            action: 'subscribe',
            channel_name,
            actor: "consumer",
        }
        
        this.broker.send(JSON.stringify(subscription_packet));
    }

    consume(callback, ack=true) {
        if (!this.isOpen) throw new Error("[Qubix] Error: borker connection is not open !!")
        if (!this.subscribed_channel) throw new Error("[Qubix] Error: not subscribed to any channel !!")
        this.broker.onmessage = (event) => {
            this.ack_required = true
            const broker_packet = JSON.parse(event.data)
            let message = broker_packet.message
            switch(broker_packet.type) {
                case "boolean":
                    message = broker_packet.message.toLowerCase() == "false" ? false : true
                    break
                case "number":
                    message = +broker_packet.message
                    break
                case "object":
                    message = JSON.parse(broker_packet.message)
                    break
                default:
                    message = broker_packet.message
            }
            callback(message)

            if (ack) {
                const ack_packet = {
                    action: 'ack',
                    channel_name: this.subscribed_channel,
                }
                this.broker.send(JSON.stringify(ack_packet));
                this.ack_required = false
            }
        };
    }

    acknowledge() {
        if (this.ack_required) {
            const ack_packet = {
                action: 'ack',
                channel_name: this.subscribed_channel,
            }
            this.broker.send(JSON.stringify(ack_packet));
            this.ack_required = false
        }
    }

}

class Publisher {
    constructor(host, port) {
        this.host = host
        this.port = port
        this.isOpen = false
        this.broker = new WebSocket(`ws://${this.host}:${this.port}`);
        this.subscribed_channel = ""
    }

    async openConnection(timeout=15) {
        this.broker.onopen = () => {
            this.isOpen = true
        };
        await delay(timeout)
        console.log('broker connection is:', this.isOpen)
    }

    subscribe(channel_name) {
        this.subscribed_channel = channel_name ? channel_name : null
        if (!this.isOpen) throw new Error("[Qubix] Error: borker connection is not open, call publisher.openConnection() to establish connection !!")
        if (!this.subscribed_channel) throw new Error("[Qubix] Error: channel provided is invalid !!")
        const subscription_packet = {
            action: 'subscribe',
            channel_name,
            actor: "publisher",
        }
        this.broker.send(JSON.stringify(subscription_packet));
    }

    publish(message) {
        if (!this.isOpen) throw new Error("[Qubix] Error: borker connection is not open !!")
        if (!this.subscribed_channel) throw new Error("[Qubix] Error: not subscribed to any channel !!")
        const type = typeof message
        const stringified = type == "object" ? JSON.stringify(message) : message + ''
        const publisher_packet = {
            action: 'publish',
            channel_name: this.subscribed_channel,
            type: type,
            message: stringified
        }
        this.broker.send(JSON.stringify(publisher_packet));
    }
}