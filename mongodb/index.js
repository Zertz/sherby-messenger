const ReplSet = require("mongodb-topology-manager").ReplSet;

(async () => {
  const bind_ip = "localhost";
  const replSet = new ReplSet(
    "mongod",
    [
      {
        options: { port: 31000, dbpath: `${__dirname}/data/db/31000`, bind_ip }
      },
      {
        options: { port: 31001, dbpath: `${__dirname}/data/db/31001`, bind_ip }
      },
      {
        options: { port: 31002, dbpath: `${__dirname}/data/db/31002`, bind_ip }
      }
    ],
    { replSet: "rs0" }
  );

  await replSet.purge();
  await replSet.start();
})();
