const { send } = require("micro");
const { MongoClient } = require("mongodb");

const db = "sherby-messenger";
const uri = `mongodb://localhost:31000,localhost:31001,localhost:31002/${db}?replicaSet=rs0`;

let client;

(async () => {
  client = await MongoClient.connect(uri, {
    useNewUrlParser: true
  });

  client
    .db(db)
    .collection("Person")
    .watch()
    .on("change", ({ documentKey, fullDocument, operationType }) => {
      console.log(new Date(), documentKey, fullDocument, operationType);
    });

  return client;
})();

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return send(res, 200);
  }

  if (req.url !== "/") {
    return send(res, 200);
  }

  await client
    .db(db)
    .collection("Person")
    .insertOne({ name: "Axl Rose" });

  send(res, 200);
};
