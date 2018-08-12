const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name price')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id
            }
          }
        })

      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    });

});

router.post('/', checkAuth, (req, res, next) => {
  // sprawdzenie czy ID produktu, ktory chcemy dodac znajduje sie w bazie
  Product.findById(req.body.productId)
    .exec()
    .then(product => {
      if(!product) {
        return res.status(404).json({
          message: 'Such productID does not exsist'
        })
      }
      // ID produktu jest w bazie, wiec moge stworzyc Order
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });
      return order.save(); // zwraca PROMISE
    })
    .then(result => {
      // gdy Order jest utworzony, to zwracam response
      console.log(result, '<===================');
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id
        }
      });
    })
    .catch( error => {
      // cos poszlo nie tak -> id Produktu nie bylo w bazie albo nie udalo sie zapisac nowego Order'a
      console.log(error);
      res.status(500).json({
        error: error
      });
    });
});

router.get('/:orderId', checkAuth, (req, res, next) => {
  const id = req.params.orderId;
  Order.findById(id)
    .select('quantity product _id')
    .populate('product')
    .exec()
    .then(doc => {

      res.status(200).json({
        id: doc._id,
        product: doc.product,
        quantity: doc.quantity,
        request: {
          type: 'GET',
          url: `http://localhost:3000/orders`
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    });
});

router.post('/:orderId', checkAuth, (req, res, next) => {
  const id = req.params.orderId;
  res.status(200).json({
    message: 'Handling POST request for specific order',
    id: id
  });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
  const id = req.params.orderId;
  Order.remove({ _id: req.body.orderId})
    .exec()
    .then()
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    });
});



module.exports = router;