const crypto = require("crypto");
const http = require("http");
const { MongoClient, ObjectId } = require("mongodb");

const db = "sherby-messenger";
const uri = `mongodb://localhost:31000,localhost:31001,localhost:31002/${db}?replicaSet=rs0`;

let client;
let watcher;

(async () => {
  client = await MongoClient.connect(uri, {
    useNewUrlParser: true
  });

  const collection = await client.db(db).collection("Messages");

  const { insertedId } = await collection.insertOne({});

  await collection.removeOne({
    _id: insertedId
  });
})();

const server = http.createServer();

const io = require("socket.io")(server);

io.on("connection", socket => {
  if (!watcher) {
    watcher = client
      .db(db)
      .collection("Messages")
      .watch({ fullDocument: "updateLookup" })
      .on("change", ({ documentKey, fullDocument, operationType }) => {
        switch (operationType) {
          case "delete": {
            socket.broadcast.emit("message:delete", documentKey._id);

            break;
          }
          case "insert": {
            socket.broadcast.emit("message:create", fullDocument);

            break;
          }
          case "update": {
            socket.broadcast.emit("message:update", fullDocument);

            break;
          }
        }
      });
  }

  socket.emit("token", crypto.randomBytes(32).toString("hex"));

  socket.on("message:create", async data => {
    try {
      const { message, token } = JSON.parse(data);

      const trimmedMessage = message.trim();

      if (trimmedMessage.length === 0) {
        return;
      }

      await client
        .db(db)
        .collection("Messages")
        .insertOne({ message: trimmedMessage, token, createdAt: new Date() });
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("message:read", async () => {
    try {
      const messages = await client
        .db(db)
        .collection("Messages")
        .find()
        .sort({
          createdAt: 1
        })
        .toArray();

      socket.emit("message:read", JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("message:update", async data => {
    try {
      const { _id, message, token } = JSON.parse(data);

      if (!ObjectId.isValid(_id)) {
        return;
      }

      await client
        .db(db)
        .collection("Messages")
        .updateOne(
          { _id: ObjectId(_id), token },
          {
            $set: {
              message,
              updatedAt: new Date()
            }
          }
        );
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("message:delete", async data => {
    try {
      const { _id, token } = JSON.parse(data);

      if (!ObjectId.isValid(_id)) {
        return;
      }

      await client
        .db(db)
        .collection("Messages")
        .remove({ _id: ObjectId(_id), token });
    } catch (e) {
      console.error(e);
    }
  });
});

server.listen(3300);
