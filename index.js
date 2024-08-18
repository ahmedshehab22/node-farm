const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");

const tempOverview = fs.readFileSync(
    `${__dirname}/templates/template-overview.html`,
    "utf-8"
);
const tempCard = fs.readFileSync(
    `${__dirname}/templates/template-card.html`,
    "utf-8"
);
const tempProduct = fs.readFileSync(
    `${__dirname}/templates/template-product.html`,
    "utf-8"
);
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

function replaceTemplate(temp, product) {
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%ID%}/g, product.id);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(
        /{%NOT_ORGANIC%}/g,
        product.organic ? "" : "not-organic"
    );
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%PRODUCT_CARDS%}/g, product);
    return output;
}

const server = http.createServer((req, res) => {
    const { query, pathname: pathName } = url.parse(req.url, true);
    // Overview Page
    if (pathName === "/" || pathName === "/overview") {
        res.writeHead(200, { "Content-type": "text/html" });
        const cards = dataObj
            .map((el) => {
                return replaceTemplate(tempCard, el);
            })
            .join("");
        const overview = replaceTemplate(tempOverview, cards);
        res.end(overview);
    }
    // Product Page
    else if (pathName === "/product") {
        res.writeHead(200, {
            "Content-type": "text/html",
        });
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);
    }
    // API
    else if (pathName === "/api") {
        res.writeHead(200, {
            "Content-type": "application/json",
        });
        res.end(data);
    }
    // NOT FOUND
    else {
        res.writeHead(404, {
            "Content-type": "text/html",
        });
        res.end("Page not found!");
    }
});

server.listen(3000, () => {
    console.log("Server is running...");
});
