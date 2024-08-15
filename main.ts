import { parse } from "ts-command-line-args";
import * as openpgp from "openpgp";
import fs from "fs";
import express from "express";
import * as dotenv from "dotenv/config";
import morgan from "morgan";
const pKey = fs.readFileSync("./data/key.txt", "utf-8");

const formatKey = pKey.split("\\n").join("\n").replaceAll('"', "");

fs.writeFileSync("./data/key.txt", formatKey);

const ppKey = fs.readFileSync("./data/key.txt", "utf-8");

fs.writeFileSync("./data/key.txt", pKey);

interface BuildOptions {
  value: string;
}

const buildOptions = parse<BuildOptions>({
  value: String,
});

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

    fs.writeFileSync("./data/result.txt", JSON.stringify(pass));
  } catch (e) {
    throw new Error(`Error pgp: ${e}`);
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

app.post("/pgp", (req, res) => {
  const { pgpKey, data } = req.body;

  if (!pgpKey || !data) res.status(400).send();

  const result = pgp(pgpKey, data);

  res.status(200).send(result);
});

app.listen(port, () => {
  console.log(`Server start on port: ${port}`);
});
