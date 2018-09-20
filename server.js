const net = require('net');
const path = require('path');
const fs = require('fs');
const port = 8124;
const qaString = 'QA';
const filesString = 'FILES'
const good = 'ACK';
const bad = 'DEC';
const saveDirectory = process.env.DIRECTORY_FOR_SAVING_FILES || 'D:/3';
const maxConnections = process.env.MAX_NUMBER_OF_CONNECTIONS || 3;
let seed = 0;
let questions = [];
let clientModes = []; // массив, хранящий режим
let files = []; // массив, хранящий содержимое файлов 
let filename = 1;
let numberOfClients = 0;

const server = net.createServer((client) => {
  if (++numberOfClients > maxConnections) {
      console.log("Превышено количество подключений!!!")
      client.write(bad);
      return;
  }
  console.log(numberOfClients);
  console.log('Client connected');
  client.setEncoding('utf8');

  client.on('data', ClientHandler);
  client.on('data', ClientQADialogue);
  client.on('data', ClientFilesDialogue);
  client.on('end', () => {
    addLineToLog(client.id, "client disconnected", "server");
    console.log('Client disconnected\n')
  });

  function ClientHandler(data, err) {
    if(err) console.error('ClientHandler: ' + err);
    else {
      if(client.id === undefined && (data === "QA" || "FILES")) {
        client.id = Date.now() + seed++;
        addLineToLog(client.id, "client connected", "server");
        filename = 1;
        clientModes[client.id] = data;
        if(data === "FILES") {
          files[client.id] = [];
          fs.mkdirSync(saveDirectory + path.sep + client.id);
        }
        client.write(good);
      }
      addLineToLog(client.id, data, "client");
    }
  }

  function ClientQADialogue(data, err) {
    if(err) console.error("ClientQADialogue: " + err)
    else {
      if (clientModes[client.id] === "QA" && data !== "QA") {
        let answer = generateAnswer();
        client.write(answer);
        addLineToLog(client.id, answer, "server");
      }
    }
  }

  function ClientFilesDialogue(data, err) {
    if(err) console.error("ClientFilesDialogue: " + err);
    else {
      if (clientModes[client.id] === "FILES" && data !== "FILES") {
        files[client.id].push(data);
        createFile(saveDirectory + path.sep + client.id, client.id);
        client.write("ФАЙЛ ПРИНЯЛ");
      }
    }
  }
});

server.maxConnections = maxConnections;

server.listen(port, () => {
  console.log(`Server listening on localhost: ${port}\n`);
});

function generateAnswer(){
  return Math.random() > 0.5 ? '1' : '0';
}
function addLineToLog(clientId, line, sender) {
  fs.appendFileSync("logs/" + clientId + ".log", (sender === "server" ? "server: " : "client: ") + line + "\n");
}
function createFile(saveDir, id) {
  fs.writeFileSync(saveDir + path.sep + (filename++) + '.txt', files[id]);
  files[id] = [];
}
