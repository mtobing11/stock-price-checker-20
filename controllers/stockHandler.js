// var arr = [];

function StockHandler() {
  this.correctForm = function(stock) {
    Array.isArray(stock) ? null : (stock = [stock]);
    stock = stock.map(item => item.toUpperCase());
    return stock;
  };

  this.checkDB = function(stockName, db) {
    return new Promise((resolve, reject) => {
      db.collection("stock").findOne({ stockName: stockName }, (err, doc) => {
        if (err) throw err;
        //console.log(doc);
        resolve(doc);
      });
    });
  };

  this.addStock = function(stockName, db, like, ip) {
    return new Promise((resolve, reject) => {
      db.collection("stock").insertOne(
        {
          stockName: stockName,
          likes: like ? 1 : 0,
          ip: like ? [ip] : []
        },
        (err, doc) => {
          if (err) throw err;
          //console.log(doc.ops[0])
          resolve(doc.ops[0]);
        }
      );
    });
  };

  this.updateStock = function(dataStock, db, like, ip, dataIp) {
    return new Promise((resolve, reject) => {
      db.collection("stock").findOneAndUpdate(
        { stockName: dataStock.stockName },
        like && dataIp.indexOf(ip) == -1
          ? { $inc: { likes: 1 }, $push: { ip: ip } }
          : { $inc: { likes: 0 } },
        { returnOriginal: false },
        (err, doc) => {
          if (err) throw err;
          resolve(doc.value);
        }
      );
    });
  };

  this.finalResponse = function(res, arr, stockNum) {
    if (stockNum == 1) {
      var stockData = {
        stockData : arr[0]
      };
      // console.log(stockData)
      res.json(stockData);
    } else if (arr.length == stockNum) {
      arr[0].rel_likes = arr[0].likes - arr[1].likes;
      arr[1].rel_likes = arr[1].likes - arr[0].likes;

      delete arr[0].likes;
      delete arr[1].likes;

      res.json({ stockData: arr });
      // arr = [];
    } else {
      console.log("still working");
    }
  };
}

module.exports = StockHandler;
