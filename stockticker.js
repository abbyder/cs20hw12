const http = require("http");
const fs = require("fs");
const qs = require("querystring");
var port = process.env.PORT || 3000;

http.createServer(function(req, res) {
    // load up form
    if (req.url == "/") {
        file = "stockticker_form.html";
        fs.readFile(file, function(err, txt) {
            if (err) {
                console.log(err);
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(txt);
            res.end();
        });
    // process form submission
    } else if (req.url == "/results") {
        res.writeHead(200, {'Content-Type':'text/html'});

        // styling for results page
        res.write("<head><title>Results | Stockticker</title><style type='text/css'>");
        res.write("html, body { font-family: 'Lucida Grande', sans-serif; margin: 30px;}");
        res.write("h1, p {text-align: center;}");
        res.write("button {padding: 5px 20px; font-family: 'Lucida Grande', sans-serif; font-size: 16px;}");
        res.write("#btn-container {display: flex; justify-content: center;}");
        res.write("#companies {display: flex; justify-content: center;}");
        res.write("ul {margin: 0px; padding-left: 20px;}");
        res.write("</style></head>")

		res.write ("<h1>Search Results</h1>");

        // get post data
        pdata = "";
        req.on("data", data => {
            pdata += data.toString();
        });

        // once post data is received
        req.on("end", () => {
			pdata = qs.parse(pdata);

            // find symbol/name in database
            let info = lookupDB(pdata["userInput"], pdata["inputType"]);
            
            info.then((data) => {
                // check if query found anything
                if (data == null) {
                    res.write("<p>\"" + pdata["userInput"] + "\" was not found in the database as a " 
                                + pdata["inputType"] + ".</p>");
                    
                    // back button
                    res.write("<br /><div id='btn-container'>");
                    res.write("<form method='post' action='https://cs20stocktickerapp.herokuapp.com/'>");
                    res.write("<button type='submit'>Search Again?</button>");
                    res.write("</form></div>")

                    res.end();
                    
                } else {
                    // writes each company
                    res.write("<p>Company Name(s): </p>")
                    res.write("<div id='companies'><ul>");
                    data.forEach(e => {
                        res.write("<li>" + e.company + "</li>");
                    });
                    res.write("</ul></div>");

                    // then writes their stock ticker symbol + price
                    res.write("<p>Stock Ticker: " + data[0].ticker + "</p>");
                    res.write("<p>Price: $" + parseFloat(data[0].price).toFixed(2) + "</p>");

                    // back button
                    res.write("<br /><div id='btn-container'>");
                    res.write("<form method='post' action='https://cs20stocktickerapp.herokuapp.com/'>");
                    res.write("<button type='submit'>Search Again?</button>");
                    res.write("</form></div>")

                    res.end();
                }
                
            }).catch((err) => {
                console.log(err);
                res.end();
            });
		});
    
    // account for unknown page results
    } else {
        res.writeHead(200, {'Content-Type':'text/html'});
		res.write ("Unknown page request");
		res.end();
    }


}).listen(port);


async function lookupDB(input, field) {
    var MongoClient = require('mongodb').MongoClient;
    const url = "mongodb+srv://abbyder393:cool@cluster0.psaukts.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    try {
        // connect to database, collection
        await client.connect();
        const dbo = client.db("stockticker_db");
        const collection = dbo.collection("companies");

        // initialize query
        let query;
        if (field == "stockticker") {
            query = { ticker : input };
        } else {
            query = { company : input };
        }

        // query database + return results
        let result = collection.find(query);
        let arr = await result.toArray();

        if (arr.length > 0) {
            return arr;
        }

    } catch(err) {
        console.log(err);
    } finally {
        // close connection once search is completed
        await client.close();
    }
}
