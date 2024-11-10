async function main() {
    /* classic method */ 
    // const ws = new WebSocket('ws://localhost:8123');

    /* wrapper class method */
    const consumer = new Consumer("localhost", 8123)
    await consumer.openConnection()

    /* classic method */ 
    // ws.onopen = () => {
    //     console.log('WebSocket connection opened');
    //     const subscription = {
    //         action: 'subscribe',
    //         channel_name: "training",
    //         actor: "consumer",
    //         message: "pls"
    //     }
    //     ws.send(JSON.stringify(subscription));

    //     const message = {
    //         action: 'consume',
    //         channel_name: "training",
    //     }
    //     ws.send(JSON.stringify(message));
    // };

    /* wrapper class method */
    consumer.subscribe("training")

    /* classic method */ 
    // ws.onmessage = (event) => {
    //     console.log(`Received message: ${event.data}`);

    //     // Sleep for 5 seconds
    //     setTimeout(() => {
    //         console.log('Woke up from sleep');
    //         const message = {
    //             action: 'ack',
    //             channel_name: "training",
    //         }
    //         ws.send(JSON.stringify(message));
    //         console.log("ack sent");
    //     }, 3000);
    // };

    /* wrapper class method */
    consumer.consume((msg) => {
        setTimeout(() => {
            console.log('Woke up from sleep:');
            console.log(msg)
            console.log("ack sent");
        }, 3000);
    })
}

main().catch(console.log)
