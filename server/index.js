if (process.env.NODE_ENV !== "production") {
  require("dotenv-safe").config();
}

const crypto = require("crypto");
const http = require("http");
const { MongoClient, ObjectId } = require("mongodb");

const db = process.env.SHERBY_MESSENGER_MONGODB_DB;

let client;
let watcher;

(async () => {
  try {
    client = await MongoClient.connect(
      process.env.SHERBY_MESSENGER_MONGODB_URI,
      {
        useNewUrlParser: true
      }
    );
  } catch (e) {
    console.error(e);
  }
})();

const server = http.createServer();

const io = require("socket.io")(server);

let connectedUsers = 0;

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

  socket.emit("user:connect", ++connectedUsers);
  socket.emit("user:token", crypto.randomBytes(32).toString("hex"));

  socket.broadcast.emit("user:connect", connectedUsers);

  socket.once("disconnect", () => {
    socket.broadcast.emit("user:connect", --connectedUsers);
  });

  socket.on("message:create", async data => {
    try {
      const { message, token } = JSON.parse(data);

      if (!token) {
        return;
      }

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
        .limit(50)
        .toArray();

      socket.emit("message:read", JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("message:update", async data => {
    try {
      const { _id, message, token } = JSON.parse(data);

      if (!ObjectId.isValid(_id) || !message || !token) {
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

      if (!ObjectId.isValid(_id) || !token) {
        return;
      }

      await client
        .db(db)
        .collection("Messages")
        .removeOne({ _id: ObjectId(_id), token });
    } catch (e) {
      console.error(e);
    }
  });
});

server.listen(3300);
