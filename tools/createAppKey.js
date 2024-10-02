// import { readFile } from 'fs/promises';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require('node:fs');

try {
  const data = require("../config.json");
  fs.writeFileSync('config.json', JSON.stringify(createAppKey(data)), err => {});
} catch (error) {
  const json = createAppKey({});   
  fs.writeFileSync('config.json', JSON.stringify(json), err => {});
}

function createAppKey(object = {}){
  object.APP_KEY = (Math.random() + 1).toString(36).substring(7);
  return object;
}