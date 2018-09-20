const net = require('net');
const fs = require('fs');
const shuffle = require('shuffle-array');
const port = 8124;
const startString = 'QA';
const good = 'ACK';
const bad = 'DEC';
let index = -1;
let questions = [];

const client = new net.Socket();
client.setEncoding('utf8');

client.connect({port: port, host: '127.0.0.1'}, (err) => {
    if(err) console.error("Соединение не установлено");
    fs.readFile("qa.json", (err, text) => {
        if (err) console.error("Невозможно прочитать файл")
        else {
            console.log("Connected")
            questions = JSON.parse(text);
            shuffle(questions);
            client.write(startString);
        }
    });
});

client.on('data', (data) => {
    if (data === bad){
        console.log("Not connected");
        client.destroy();
    }

    if (data === good)
        sendQuestion();

    if (data !== good && data !== bad) {
        let qst = questions[index];
        let answer = qst.good;
        console.log(`\nQuestion: ${qst.question}`);
        console.log(`---Right answer: ${answer}`);
        console.log(`---Server's answer: ${data}`);
        console.log('---Result: ' + (data === answer ? 'Right answer!': 'Wrong answer!'));
        sendQuestion();
    }
});

client.on('close', function () {
    console.log('Connection closed');
});

function sendQuestion() {
    if (index < questions.length - 1) {
        let qst = questions[++index].question;
        client.write(qst);
    }
    else
        client.destroy();
}