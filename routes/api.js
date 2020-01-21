/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var fetch = require("node-fetch");
var url = "https://repeated-alpaca.glitch.me/v1/stock/";

var StockHandler = require("../controllers/stockHandler.js");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const stockHandler = new StockHandler(); // to make it an object

module.exports = function(app) {
  app.route("/api/stock-prices").get(function(req, res) {
    var stock = req.query.stock;
    var like = req.query.like || false;
    var ip = req.ip;
    
    // console.log(ip)
    // console.log(req.query);
    // console.log(req.query.stock);
    // console.log(req.query.stock);

    stock = stockHandler.correctForm(stock); //this how you call an object

    MongoClient.connect(CONNECTION_STRING, (err, db) => {
      var data3 = [];
      
      stock.map(item => {
        fetch(url + item + "/quote")
          .then(response => response.json())
          .then(data => {
            //console.log(data.latestPrice)
            var stockPrice = data.latestPrice;

            stockHandler.checkDB(item, db).then(data => {
              //console.log(data);
              if (data == null) {
                stockHandler.addStock(item, db, like, ip).then(data4 => {
                  // console.log(data4);
                  var sendResponse = {
                    stock: data4.stockName,
                    price: stockPrice,
                    likes: data4.ip.length
                  };
                  data3.push(sendResponse);
                  var stockNum = stock.length;
                  stockHandler.finalResponse(res,data3,stockNum)
                });
              } else {
                stockHandler
                  .updateStock(data, db, like, ip, data.ip)
                  .then(data2 => {
                    var sendResponse = {
                      stock: data2.stockName,
                      price: stockPrice,
                      likes: data2.ip.length
                    };
                    // console.log(data3)
                    data3.push(sendResponse);
                    var stockNum = stock.length;
                    // console.log(data3)
                    stockHandler.finalResponse(res, data3, stockNum);
                    // .then(response=>console.log(response));
                  });
              }
            });
          });
      });
    });

    // res.type("text").send("Hello my bass player");
  });
};
