const mongoose = require('mongoose');
const Product = require('../models/product');

exports.products_create_product = (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });

  product.save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'New product added',
        createdProduct: product
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });

};

exports.products_get_all = (req, res, next) => {
  Product.find()
    .select('name price _id')
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs
      };
      res.status(200).json(response);
    })
    .catch( err => {
      console.log(err);
      res.status(500).json({error: 'No objects found'})
    });
};

exports.products_get_product =  (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then( doc => {
      console.log("From DB:", doc);
      if(doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ error: "No valid object found for provided ID"});
      }
    })
    .catch( err => {
      console.log(err);
      res.status(500).json({error: err});
    });
};

exports.products_edit_product = (req, res, next) => {
  const id = req.params.productId;
  const updatedProduct = {};
  for (const key of Object.keys(req.body)) {
    updatedProduct[key] = req.body[key];
  }
  Product.update({ _id: id}, { $set: updatedProduct}).exec()
    .then( doc => {
      res.status(200).json({
        message: 'Product updated',
        product: doc
      });
    })
    .catch( err => {
      res.status(500).json({
        message: 'Something went wrong'
      });
    });

};

exports.products_delete_product = (req, res, next) => {
  const id = req.params.productId;
  Product.findByIdAndRemove(id)
    .exec()
    .then( product => {
      console.log("Deleting:", product);
      res.status(200).json({
        message: `Product with ${id} has been deleted`,
        product: product
      });
    })
    .catch( err => {
      console.log(err);
      res.status(404).json({
        message: `Product with id ${id} does not exist in database`
      })
    });
};