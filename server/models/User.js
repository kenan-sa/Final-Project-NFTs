const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  tokens: Number,
  nfts: [String], // Assuming NFTs are stored as strings for simplicity
});

const User = mongoose.model('User', userSchema);

module.exports = User;
