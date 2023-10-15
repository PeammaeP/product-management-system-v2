import express from 'express'; 
import morgan from 'morgan';
import mongoose from 'mongoose';

const myApp = express();

myApp.use(morgan('combined')); //display all logging in terminal
myApp.use(express.json()); //middleware 

/*//creating MongoDB ( using as database )
const db = mongoose.connection;
db.createCollection("products", function(err, res) {
  //exception handling part 
  if (err) throw err;
  //if created successfully !! 
  console.log("Collection created!");
});*/

//Connection.prototype.createCollection() method no longer accepts a callback.
//Use this instead 

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB !');
});

mongoose.connection.createCollection('my_stocks_collection')
  .then(collection => {
    console.log('Collection created');
  })
  .catch(err => {
    throw err;
});

mongoose.connect('mongodb://localhost:27017/myStocksDB', {useNewUrlParser: true, useUnifiedTopology: true}); 
//Creating The Schema of Stocks
const StocksSchema = new mongoose.Schema({
    stock_name: String,
    stock_category: String,
    stock_price: Number,
    stock_remaining: Number
});

const myStocks = mongoose.model('myStocks',StocksSchema);  
//end of process of mongoDB 

//POST API using premises
myApp.post('/stocks', (req, res) => {
    const newStocks = new myStocks(req.body);
    newStocks.save().then(result => {
    res.status(200).send(result);
  })
  .catch(err => {
    res.status(500).send(err);
  });
});

//GET API [ using Promises instead ]
myApp.get('/stocks', (req, res) => {
    myStocks.find().then((stocks) => {
        if (!stocks || stocks.length === 0) {
          res.status(404).send('No data found in here');
        } else {
          res.status(200).send(stocks);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Internal server error');
      });
  });

//PUT API using Premises
myApp.put('/stocks/:id', (req, res) => {
    myStocks.updateOne({ _id: req.params.id }, req.body)
    .then((result) => {
    if (result.ok === 1) {
      res.status(200).send('Updated successfully');
    } else {
      res.status(204).end(); // 204 No Content
    }
  })
  .catch((err) => {
    res.status(500).send(err);
  });
  });

//DELETE API using premises
myApp.delete('/stocks/:id', (req, res) => {
    myStocks.deleteOne({ _id: req.params.id })
    .then(() => {
    res.status(200).send('Deleted successfully');
    })
     .catch(err => {
    res.status(500).send(err);
  }  );
});

//Server Running
myApp.listen(3000, () => {
    console.log('Server is running on port 3000');
});









