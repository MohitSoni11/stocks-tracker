////////////////////////////////////////////
/********* Requiring npm Packages *********/
////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const { spawn } = require('child_process');

//////////////////////////////////
/********* Creating App *********/
//////////////////////////////////

const hostname = '127.0.0.1';
const port = 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

/////////////////////////////////////////
/********* Setting up Database *********/
/////////////////////////////////////////

mongoose.connect('mongodb://localhost:27017/db')
.then(() => (
    console.log('MongoDB connected.')
))
.catch(() => (
  console.log('ERROR: MongoDB could not connect.')
));

/////////////////////////////////////////////////////////
/********* MongoDB Collection Schemas & Models *********/
/////////////////////////////////////////////////////////

const TypeSchema = mongoose.Schema({
  name: { 
    type: String, 
    required: true
  }
});

const AccountSchema = mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const TransactionTypeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const TickerSchema = mongoose.Schema({
  ticker: {
    type: String,
    required: true
  }
});

const LotNumSchema = mongoose.Schema({
  num: {
    type: Number,
    required: true
  }
});

const LotSchema = mongoose.Schema({
  lot: {
    type: Number,
    required: true
  },
  buyDate: {
    type: Date,
    required: true
  },
  account: {
    type: String,
    required: true
  },
  ticker: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    required: true
  },
  buyQuantity: {
    type: Number,
    required: true
  },
  buyPrice: {
    type: Number,
    required: true
  },
  sellQuantity: {
    type: Number,
    default: 0,
    required: true
  },
  sellReturn: {
    type: Number,
    default: 0,
    required: true
  }
});

const sellSchema = mongoose.Schema({
  ticker: {
    type: String,
    required: true
  },
  lot: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    required: true
  }
});

const Type = mongoose.model('type', TypeSchema);
const Account = mongoose.model('account', AccountSchema);
const TransactionType = mongoose.model('transactionType', TransactionTypeSchema);
const Ticker = mongoose.model('ticker', TickerSchema);
const LotNum = mongoose.model('lotNum', LotNumSchema);
const Lot = mongoose.model('lot', LotSchema);
const Sell = mongoose.model('sell', sellSchema);

//////////////////////////////////////
/********* Helper Functions *********/
//////////////////////////////////////

function callPythonFunction(functionName, args) {
  return new Promise((resolve, reject) => {
    const python = spawn('.venv\\Scripts\\python.exe', ['scripts.py']);

    python.stdin.write(JSON.stringify({ function: functionName, args}));
    python.stdin.end();

    var output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}`));
      } else {
        try {
          resolve(JSON.parse(output));
        } catch (err) {
          reject(new Error(`Failed to parse Python output: ${err.message}`));
        }
      }
    });
  });
}

/////////////////////////////
/********* Routing *********/
/////////////////////////////

app.get('/', async (req, res) => {
  const lotNums = await LotNum.find({});
  if (lotNums.length == 0) {
    data = {
      num: 0
    };

    await LotNum.insertMany([data]).then(() => {
      console.log('Added Initial Lot Num');
    }).catch((error) => {
      console.log('ERROR: ' + error);
    });
  }

  const types = await Type.find({});
  const accounts = await Account.find({});
  const transactionTypes = await TransactionType.find({});
  const tickers = await Ticker.find({});

  res.render('home', {types: types, accounts: accounts, transactionTypes: transactionTypes, tickers: tickers});
});

app.post('/add-account-type', async (req, res) => {
  const results = await Type.find({ name: req.body.name });

  // Adding type if it is not already present in the database
  if (results.length == 0) {
    data = {
      name: req.body.name
    };

    await Type.insertMany([data]).then(() => {
      console.log('Added Account Type: ' + data.name);
    }).catch((error) => {
      console.log('ERROR: ' + error);
    });
  } else {
    console.log('ERROR: Account type already present.')
  }

  res.redirect('/');
});

app.post('/add-account', async (req, res) => {
  const results = await Account.find({ name: req.body.name });

  // Adding account if it is not already present in the database
  if (results.length == 0) {
    data = {
      type: req.body.type,
      name: req.body.name
    };

    await Account.insertMany([data]).then(() => {
      console.log('Added Account: ' + data.name + ' with type ' + data.type);
    }).catch((error) => {
      console.log('ERROR: ' + error);
    });
  } else {
    console.log('ERROR: Account already present.')
  }

  res.redirect('/');
});

app.post('/add-transaction-type', async (req, res) => {
  const results = await TransactionType.find({ name: req.body.name });

  // Adding transaction type if it is not already present in the database
  if (results.length == 0) {
    data = {
      name: req.body.name
    };

    await TransactionType.insertMany([data]).then(() => {
      console.log('Added Transaction Type: ' + data.name);
    }).catch((error) => {
      console.log('ERROR: ' + error);
    });
  } else {
    console.log('ERROR: Transaction Type already present.')
  }

  res.redirect('/');
});

app.post('/add-ticker', async (req, res) => {
  const results = await Ticker.find({ ticker: req.body.ticker });

  // Adding ticker if it is not already present in the database
  if (results.length == 0) {
    data = {
      ticker: req.body.ticker
    };

    await Ticker.insertMany([data]).then(() => {
      console.log('Added Ticker Type: ' + data.ticker);
    }).catch((error) => {
      console.log('ERROR: ' + error);
    });
  } else {
    console.log('ERROR: Ticker already present.')
  }

  res.redirect('/');
});

app.get('/fetch/company', async (req, res) => {
  const ticker = req.query.ticker?.toUpperCase();
  const result = await callPythonFunction('tickerToCompany', { ticker: ticker });
  res.json({
    company: result['result']
  });
});

app.get('/fetch/lots', async (req, res) => {
  const ticker = req.query.ticker?.toUpperCase();
  const results = await Lot.aggregate([
    {
      $match: {
        ticker: ticker,
        $expr: { $ne: ['$buyQuantity', '$sellQuantity'] } // Compare buyQuantity and sellQuantity
      }
    }
  ]);
    
  res.json({
    lots: results
  })
});

app.get('/fetch/atype', async (req, res) => {
  const account = req.query.account;
  const results = await Account.find({ name: account });

  res.json({
    type: results[0].type
  });
});

app.get('/fetch/currentPrice', async (req, res) => {
  const ticker = req.query.ticker?.toUpperCase();
  const result = await callPythonFunction('getCurrentPrice', { ticker: ticker });
  res.json({
    price: result['result']
  });
});

app.get('/fetch/avgSoldPrice', async (req, res) => {
  const id = req.query.id;
  const results = await Sell.find({ lot: id });

  const totals = results.reduce((acc, result) => {
    acc.sellAmount += result.price * result.quantity;
    acc.sellQty += result.quantity;
    return acc;
  }, { sellAmount: 0, sellQty: 0 });

  const avgSoldPrice = totals.sellQty != 0 ? totals.sellAmount / totals.sellQty : 0;
  res.json({
    price: avgSoldPrice
  });
});

app.post('/buy', async (req, res) => {
  const now = new Date();
  const providedDate = new Date(req.body.date);
  providedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

  await LotNum.updateOne({}, { $inc: { num: 1 }});

  const results = await LotNum.find({});

  data = {
    lot: results[0].num,
    buyDate: providedDate,
    account: req.body.account,
    ticker: req.body.buyTicker,
    transactionType: req.body.transactionType,
    buyQuantity: req.body.quantity,
    buyPrice: req.body.price
  };

  await Lot.insertMany([data]).then(() => {
    console.log('Bought ' + data.buyQuantity + ' stocks of ' + data.ticker + ' at price ' + data.buyPrice);
  }).catch((error) => {
    console.log('ERROR: ' + error);
  });

  res.redirect('/');
});

app.post('/sell', async (req, res) => {
  data = {
    ticker: req.body.sellTicker,
    lot: req.body.lot,
    quantity: req.body.quantity,
    price: req.body.price,
    fee: req.body.fee
  };

  const currLot = await Lot.findOne({ lot: data.lot });
  soldQty = Number(data.quantity);

  if (currLot.buyQuantity < currLot.sellQuantity + soldQty) {
    console.log('Error: Cannot sell more than bought.');
    res.redirect('/');
    return;
  }

  currLot.sellQuantity += soldQty;
  currLot.sellReturn += soldQty * Number(data.price) - Number(data.fee);
  await currLot.save();

  await Sell.insertMany([data]).then(() => {
    console.log('Sold ' + soldQty + ' stocks of ' + data.ticker + ' at price ' + data.price);
  }).catch((error) => {
    console.log('Error: ' + error);
  });

  res.redirect('/');
});

app.post('/delete-account-types', async (req, res) => {
  const result = await Type.deleteMany({});
  console.log(`${result.deletedCount} account types deleted.`);
  res.redirect('/');
});

app.post('/delete-accounts', async (req, res) => {
  const result = await Account.deleteMany({});
  console.log(`${result.deletedCount} accounts deleted.`);
  res.redirect('/');
});

app.post('/delete-transaction-types', async (req, res) => {
  const result = await TransactionType.deleteMany({});
  console.log(`${result.deletedCount} transaction types deleted.`);
  res.redirect('/');
});

app.post('/delete-tickers', async (req, res) => {
  const result = await Ticker.deleteMany({});
  console.log(`${result.deletedCount} tickers deleted.`);
  res.redirect('/');
});

app.post('/delete-lots', async (req, res) => {
  const result = await Lot.deleteMany({});
  console.log(`${result.deletedCount} lots deleted.`);
  res.redirect('/');
});

app.post('/delete-sells', async (req, res) => {
  const result = await Sell.deleteMany({});
  console.log(`${result.deletedCount} sells deleted.`);
  res.redirect('/');
});