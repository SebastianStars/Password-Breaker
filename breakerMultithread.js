// Created by Sebastian_Stars, do not redistribute without permissions
// If any issues are found, create a Github issue or contact me using: 
// Discord: @sebastian_stars
// Email: sebastian.stars99@gmail.com

const {setEnvironmentData, Worker, MessageChannel, MessagePort, isMainThread, parentPort, workerData, getEnvironmentData, threadId} = require("node:worker_threads");

const prompt = require("prompt-sync")();

const chars = [('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*() ' + '`'), "abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz1234567890", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890", ["password", "Password", "apple", "Apple", "p@55w0rd", "P@55w0rd", "p@55W0rd", "Blue", "blue", "red", "Red", "bingus", "Bingus", "The", "the", "My", "my", "How", "how", "123456", "12345678", "dragon", "Dragon", "Dr@gon", "Freddy", "freddy", "qwerty", "QWERTY", "qwertyuiop", "QWERTYUIOP", "1q2w3e4r5t", "1qaz2wsx3edc", "qazwsx", "fuck", "Fuck", "FUCK", "shit", "Shit", "SHIT", "you", "You", "YOU", "me", "Me", "ME", "thank", "Thank", "THANK", "for", "For", "FOR", "access", "@ccess", "@CCESS", "ACCESS", "Access", "StarWars", "starwars", "st@rw@rs", "St@rW@rs", "st@r", "w@rs", "star", "war", "wars", "Star", "Wars", "War", "Snow", "Man", "snowman", "SnowMan", "Bird", "Birb", "bird", "birb", "B1rb", "B1rd", "b1rd", "b1rb"]];
const sim = ["", "1", "2", "3", "4", "5", "6", "7", "8", "0", "12", "123", "123#", "#123", "21", "321", "123!", "69", "6969", "420", "69420", "12345", "54321", "177", "77", "7"];

function SetPass()
{
    let pass;
    let minLen;
    let useRand;
    let checkSim;

    while (useRand == null)
    {
        let inp = prompt("Generate random password? (y/n) ")
        if (inp.toLowerCase().startsWith("y"))
            useRand = true;
        else if (inp.toLowerCase().startsWith("n"))
            useRand = false;
    }
    if (useRand)
    {
        randLen = 0;
        while (randLen <= 0 || isNaN(randLen))
        {
            let inp = Number(prompt("Random password length? "));
            if (inp <= 0)
                console.log("Input must be greater than 0. Please try again. ");
            else if (isNaN(inp))
                console.log("Invalid input. Please try again. ");
            else
                randLen = inp;
        }

        pass = RandPass(randLen, chars[0]);
        console.log(`Using randomly generated password "${pass}"`);
    }
    else 
        while(pass == null)
        {
            let inp = prompt("Password to break? ");
            if (inp.length > 0)
                pass = inp;
        }
    while (checkSim == null)
    {
        let inp = prompt("Check similar passwords (y/n) ")
        if (inp.toLowerCase().startsWith("y"))
            checkSim = true;
        else if (inp.toLowerCase().startsWith("n"))
            checkSim = false;
    }
    while (isNaN(minLen) || minLen < 0 || minLen > pass.length)
    {
        let inp = Number(prompt(`Minimum length? (max ${pass.length}) `));
        if (inp > pass.length)
            console.log("Minimum length cannot be greater than password length. Please try again.");
        else if (inp < 0)
            console.log("Minimum length cannot be less than 0. Please try again.");
        else if (isNaN(inp))
            console.log("Invalid input. Please try again.");
        else
            minLen = inp;
    }
    return {pass, minLen, checkSim};
}

function RandPass(length, digits)
{
    let out = "";
    let last = -1;
    for (let i = 0; i < length; i++)
    {
        let rand = digits[Math.floor(Math.random() * digits.length)];
        while (rand === last)
            rand = digits[Math.floor(Math.random() * digits.length)];
        out += rand;
        last = rand;
    }

    return out;
}

function Breaker(pass, CheckSim = false, minLen = 0, chars)
{    
    let guess = [];
    let found = false;
    for (let i = 0; i < minLen; i++)
        guess.push(0);

    while (found === false)
    {
        if (!CheckSim)
        {
            console.log(StringGuess(guess, chars));
            found = (StringGuess(guess, chars) === pass);
            if (found)
                parentPort.postMessage(StringGuess(guess, chars));
        }
        else
            for (let i = 0; i < sim.length; i++)
            {
                console.log(StringGuess(guess, chars) + sim[i]);
                found = (StringGuess(guess, chars) + sim[i] === pass);
                if (found)
                    parentPort.postMessage(StringGuess(guess, chars) + sim[i]);
            }
            
        if (found)
            break;
        else
            guess = IncreaseDigit(chars, guess);
    }
}

function IncreaseDigit(chars, guess, digit = guess.length-1)
{
    if (guess[digit] < chars.length-1)
        guess[digit]++;
    else
    {
        guess[digit] = 0;

        if (digit > 0)
            guess = IncreaseDigit(chars, guess, digit - 1);
        else
            guess.push(0);
    }

    return guess;

}

function StringGuess(guess, chars)
{
    let out = "";

    for (let i = 0; i < guess.length; i++)
        out += chars[guess[i]];

    return(out);
}

if (isMainThread)
{    
    console.clear();
    let data = SetPass();

    let workers = [];
    let waiting = true;

    console.time("Search Time");

    for (let i = 0; i < chars.length; i++)
    {
        setEnvironmentData("data", {data, "thread":i});
        let worker = new Worker("./breakerMultithread");
        
        workers.push(worker);

        worker.on("message", (message) =>
        {
            if (message === data.pass)
            {
                waiting = false;

                console.timeEnd("Search Time");

                for (let i = 0; i < workers.length; i++)
                    workers[i].terminate();
            }
    
        });
    }
}
else
{
    data = getEnvironmentData("data");
    console.log(`Started working on thread ${data.thread}`);

    Breaker(data.data.pass, data.data.checkSim, data.data.minLen, chars[data.thread]);
}