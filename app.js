import { getData, checkIfFileExists, checkIfFolderExists} from "./data.js";
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let userChoice;
let tokenIdArray;
let userCoinChoice;

await inquirer.prompt([{
    type: 'list',
    name: 'userChoice', 
    message: ('What do you want me to do ?'),
    choices: ['Show coin list', 'Start the server'],
    default : 'Show coin list',
}]).then(res => {
    userChoice = res.userChoice;
});


if (userChoice == "Show coin list") {
    tokenIdArray =  await checkIfFileExists(path.join(__dirname, 'cache', 'coins.json'));
    tokenIdArray = tokenIdArray.splice(0, 30); 
    await inquirer.prompt([{
        type:'list', 
        name: 'userCoinChoice',
        choices: tokenIdArray,
        message: ('Choose of the coins'),
        default: tokenIdArray[0],
    }]).then(res => {
        userCoinChoice = res.userCoinChoice;
    });

    let coinInfo = await getData(`https://api.coingecko.com/api/v3/coins/${userCoinChoice}/market_chart?vs_currency=usd&days=max`);
    coinInfo = JSON.stringify(coinInfo.data);

    await checkIfFolderExists(userCoinChoice);

    let date = new Date();
    date = date.toISOString();
    date = date.split(':').join('-');
    fs.writeFileSync(path.join(__dirname, 'cache', 'market-charts', userCoinChoice, `${date}.json`), coinInfo);
    console.log(date + '.json file has been created successfully!');

}
else {
    tokenIdArray = await checkIfFileExists(path.join(__dirname, 'cache', 'coins.json'), true);
    let data = fs.readFileSync(path.join(__dirname, 'cache', 'coins.json'));
    const app = express();

    app.get('/coins/all', (req, res) => {
        res.send(JSON.parse(data.toString()));
    });

    app.get('/market-chart/:coinId', async (req, res) => {
        await checkIfFolderExists(req.params.coinId);

        var content = fs.readdirSync(path.join(__dirname, 'cache', 'market-charts', req.params.coinId))
        if (content.length == 0) {
            let coinInfo = await getData(`https://api.coingecko.com/api/v3/coins/${req.params.coinId}/market_chart?vs_currency=usd&days=max`);
            coinInfo = JSON.stringify(coinInfo.data);
            let date = new Date();
            date = date.toISOString();
            date = date.split(':').join('-');
            fs.writeFileSync(path.join(__dirname, 'cache', 'market-charts', req.params.coinId, `${date}.json`), coinInfo);
            res.send(JSON.parse(coinInfo));
        }
        else {
            let jsonData = fs.readFileSync(path.join(__dirname, 'cache', 'market-charts', req.params.coinId, content[content.length-1]))
            res.send(JSON.parse(jsonData));
        }

    })

    app.listen(3000, ()=> {
        console.log(`Server running at http://localhost:3000/coins/all\nCheck http://localhost:3000/market-chart/{${('coin-name')}}`);
    })
}

