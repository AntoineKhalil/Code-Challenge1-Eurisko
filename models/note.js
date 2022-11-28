const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema(
    {
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      dateAdded: {
        type: String,
        required: true
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
      },
      tags: [
        {
          type: String
        }
      ]
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Note', noteSchema);