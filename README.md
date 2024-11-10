# Quick start
Qubix is a simple realtime queue system that uses Websockets under the hood and stores a queue for each channel in RAM, once a publisher is defined and subscribed to a channel, they can publish any payload to the queue, the message will be sent to *only one* consumer of that queue randomlly *not all*, examples for both the publisher and consumer codes are provided in the `/examples` directory, along with a wrapper classes for `Consumer` and `Publisher` that abstract away the direct use of websockets and simplifies the process
## Starting Qubix
starting Qubix is as simple as installing the one required package using:
```
npm install
```
and then you can run the Qubix broker using:
```
node index.js
```
Qubix runs on port 8123 by default

## Example of Consumer
In this simple script we create a consumer object while providing the host and port where Qubix runs then it is important to call `await consumer.openConnection()` to establish the connection with the broker then we subscribe to a channel named "training" and wait for any messages to come from a publisher:

```javascript
async function main() {
    const consumer = new Consumer("localhost", 8123)
    await consumer.openConnection()

    consumer.subscribe("training")

    consumer.consume((msg) => {
        setTimeout(() => {
            console.log('Woke up from sleep:');
            console.log(msg)
            console.log("ack sent");
        }, 3000);
    })
}

main().catch(console.log)
```

## Example of Publisher
In this simple script we create a publisher and subscribe similar to the consumer example except we use the `Publisher` wrapper instead and we call `publisher.publish()` to publish a message to the queue (refer to the examples directory for the working example):

```javascript
async function main() {
    /**
    * @type {HTMLButtonElement}
    */
    const button = document.querySelector("#btn")

    const publisher = new Publisher("localhost", 8123)
    await publisher.openConnection()

    publisher.subscribe("training")

    button.onclick = function() {
        publisher.publish({msg: "Hello, World!", something: "else"})
    }
    
}

main().catch(console.log)

```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' ws://localhost:8123;">
    <script src="lib/wrapper.js"></script>
    <script src="publisher.js" defer></script>
    <title>Document</title>
</head>
<body>
    <button id="btn">publish</button>
</body>
</html>
```