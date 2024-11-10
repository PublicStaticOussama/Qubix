async function main() {
    /**
    * @type {HTMLButtonElement}
    */
    const button = document.querySelector("#btn")

    /* classic method */ 
    // const ws = new WebSocket('ws://localhost:8123');

    /* wrapper class method */
    const publisher = new Publisher("localhost", 8123)
    await publisher.openConnection()

    /* classic method */ 
    // ws.onopen = () => {
    //     console.log('WebSocket connection opened');
    //     const subscription = {
    //         action: 'subscribe',
    //         channel_name: "training",
    //         actor: "publisher",
    //         message: "pls"
    //     }
    //     ws.send(JSON.stringify(subscription));
    // };

    /* wrapper class method */
    publisher.subscribe("training")

    /* classic method */ 
    // button.onclick = function() {
    //     const message = {
    //         action: 'publish',
    //         channel_name: "training",
    //         type: "string",
    //         message: "Hello, World!"
    //     }
    //     ws.send(JSON.stringify(message));
    // }

    /* wrapper class method */
    button.onclick = function() {
        publisher.publish({msg: "Hello, World!", something: "else"})
    }
    
}

main().catch(console.log)
