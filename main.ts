import { parse } from "ts-command-line-args";
import * as openpgp from "openpgp";
import fs from "fs";
import express from "express";
import * as dotenv from "dotenv/config";
import morgan from "morgan";

const publicKey = async (key: string) => {
  return openpgp.readKey({
    armoredKey: key,
  });
};

async function pgp(value: string, key: string) {
  try {
    const message = await openpgp.createMessage({ text: value });
    const pass = await openpgp.encrypt({
      message,
      encryptionKeys: await publicKey(key),
      format: "armored",
    });
    return pass;
  } catch (e) {
    throw new Error(`Pgp ${e}`);
  }
}
// main(buildOptions.value, ppKey);

const app = express();

//middlewares
app.use(express.json());
app.use(morgan("combined"));

const port = process.env.PORT || 6666;

//routes
app.get("/", (req, res) => {
  res.send("Estelink PGP");
});

app.post("/pgp", async (req, res) => {
  const { key, data } = req.body;

  if (!key || !data) return res.status(400).send("key/data field are required");

  try {
    const result = await pgp(data, key);

    return res.status(200).send(JSON.stringify(result));
  } catch (e) {
    return res.status(400).send(`${e}`);
  }
});

app.listen(port, () => {
  console.log(`Server start on port: ${port}`);
});
