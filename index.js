const axios = require("axios").default;
const readline = require("readline");
const fs = require("fs")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function input(question) {
    return new Promise((resolve, reject) => {
        rl.question(`\x1b[33m[*] \x1b[0m${question}`, (answer) => resolve(answer) );
    });
}
console.info = (str) => console.log(`\x1b[33m[*] \x1b[0m${str}`)
console.success = (str) => console.log(`\x1b[32m[+] \x1b[0m${str}`)
console.error = (str) => console.log(`\x1b[31m[-] \x1b[0m${str}`)

var details = {}
async function start() {
    console.clear()
    console.success("Script started")
    let token = await input("Enter authorization token: ")
    checkToken(token)
}

async function checkToken(token) {
    console.success(`Token checking.. [${token}]`)
    if(token.length!=59) {
        console.error("Invalid token!")
        console.info("Script shutdown.")
        process.exit()
    }
    var response = await axios.request({
        url:`https://discord.com/api/v6/invite/1`,
        method:"POST",
        headers: {
            "accept":"*/*",
            "content-type":"application/json",
            'Authorization': token
        } 
    }).catch(x=>x.response)
    if(response.data.message && response.data.message.toLowerCase().includes("unauthorized")) {
        console.error("Invalid token!")
        console.info("Script shutdown.")
        process.exit()
    }
    else {
        console.success(`Token checked. [${token}]`)
        details.token = token;
        var avatarURL = await input("Enter avatar image URL: ")
        checkAvatar(avatarURL)
    }
}

async function checkAvatar(url) {
    console.success(`Avatar URL checking.. [${url}]`)
    if(!fs.existsSync(url)) {
        if(!url.includes("http") && !url.includes("https")) {
            console.error("Invalid URL!")
            console.info("Script shutdown.")
            process.exit()
        }
        console.success("Image downloading..")
        let image = await axios.request({
            url:url,
            method:"get",
            responseType: 'arraybuffer'
        })
        let base64 = Buffer.from(image.data).toString("base64")
        if(!base64) {
            console.error("Invalid URL!")
            console.info("Script shutdown.")
            process.exit()
        }
        setAvatar(base64)
    }
    else { 
        let base64 = fs.readFileSync(url).toString("base64")
        console.success("Image founded..")
        setAvatar(base64)
    }
    
}

async function setAvatar(base64) {
    console.info("Avatar configuring.")
    let res = await axios.request({
        url:"https://discord.com/api/v9/users/@me",
        method:"patch",
        headers: {
            "accept":"*/*",
            "content-type":"application/json",
            'Authorization': details.token
        },
        data: {
            avatar:`data:image/png;base64,${base64}`
        }
    })
    if(res.status==200) {
        console.success("Avatar configured.")
        console.info("Script shutdown.")
        process.exit()
    }
}

start()
