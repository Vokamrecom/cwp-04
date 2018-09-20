const net = require('net');
const fs = require('fs');
const port = 8124;
const startString = 'REMOTE';
const good = 'ACK';
const bad = 'DEC';

const client = new net.Socket();
client.setEncoding('utf8');

client.connect({port: port, host: '127.0.0.1'}, (err) => {
    if(err) console.error("Соединение не установлено");
    else {
        client.write(startString);
    }
});

client.on('data', (data) => {
    if (data === bad){
        console.log("Not connected");
        client.destroy();
    }

    if (data === good) {
        console.log("Connected");
        sendCopy();
    }

    if (data === "DONE CLONE") {
        sendEncode();
    }

    if (data === "DONE ENCODE") {
        sendDecode();
    }

    if (data === "DONE DECODE") {
        client.destroy();
    }

});

client.on('close', function () {
    console.log('Connection closed');
});

function sendCopy() {
    client.write('COPY files/1.txt files/1-copy.txt');
}

function sendEncode(callback) {
    client.write('ENCODE files/1.txt files/1-encoded.txt 1234');
}

function sendDecode() {
    client.write('DECODE files/1-encoded.txt files/1-decoded.txt 1234');
}