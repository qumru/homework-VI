import axios from "axios";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenIdArray = [];

export function getData(url) {
    return axios.get(url);
}

export async function checkIfFileExists (path, all = false) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync('cache')

        const coinsList = await getData('https://api.coingecko.com/api/v3/coins/list');
        let jsonObj = {};
        if (all) {
            for (let i = 0; i < coinsList.data.length; i++) {
                jsonObj[i] = coinsList.data[i];
            }
        }else {
            for (let i = 0; i < 30; i++) {
                jsonObj[i] = coinsList.data[i];
            }
        }
        
        jsonObj = JSON.stringify(jsonObj);
        fs.writeFileSync(path, jsonObj);
    }

    var content = fs.readFileSync(path);
    content = JSON.parse(content.toString());
    for (let id in content) {
        tokenIdArray.push(content[id].id);
    }
    return tokenIdArray;
}

export async function checkIfFolderExists (foldername) {
    if (!fs.existsSync(path.join(__dirname, 'cache', 'market-charts'))) {
        fs.mkdirSync(path.join(__dirname, 'cache', 'market-charts'));
    }

    if (!fs.existsSync(path.join(__dirname, 'cache', 'market-charts', foldername))) {
        fs.mkdirSync(path.join(__dirname, 'cache', 'market-charts', foldername));
    } 
}
