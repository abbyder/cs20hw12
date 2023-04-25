const readline = require("readline");
const fs = require("fs");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://abbyder393:cool@cluster0.psaukts.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);


// create stream to read in companies.csv file
var file = readline.createInterface({
    input: fs.createReadStream("companies.csv")
});

// for every line in file stream, parse line data and add to collection
let firstLine = true;
file.on("line", function(line) {
    let lineData = line.split(",");
    // skip data names
    if (firstLine) {
        firstLine = false;
        return;
    }

    // instantiate data to insert
    let name = lineData[0];
    let stockTicker = lineData[1];
    let price = lineData[2];

    let newData = {
        "company": name,
        "ticker": stockTicker,
        "price": price
    };

    // add data to database
    insertDB(newData);
})

// function access stockticker_db database and companies collection in it,
// inserts given data into database collection
async function insertDB(data) {
    var MongoClient = require('mongodb').MongoClient;
    const url = "mongodb+srv://abbyder393:cool@cluster0.psaukts.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    try {
        // connect to database, collection
        await client.connect();
        const dbo = client.db("stockticker_db");
        const collection = dbo.collection("companies");

        // insert data
        await collection.insertOne(data, function(err, res) {
            if (err) {
                throw err;
            }
        });

    } catch(err) {
        console.log(err);
    } finally {
        // close connection once data is inserted
        await client.close();

    }
}

