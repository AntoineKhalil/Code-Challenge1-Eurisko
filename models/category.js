const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
    {
      title: {
        type: String,
        required: true
      },
      creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      description: {
        type: String,
        trim: true,
        required: false
      },
      notes: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Note'
        }
      ]
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('category', categorySchema);