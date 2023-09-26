/**
 * Users.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
 let bcrypt = require('bcryptjs');
 let mongo = sails.config.globals.MongoClient;
 let mongoURL = sails.config.globals.mongourl;

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

  validateUser: (data, callback) => {
            mongo.connect(mongoURL, { useUnifiedTopology: true }, function(err, client) {
                if (err) {
                    callback(err);
                }
                let db = client.db('users');
                let collectionName = 'login_credentials';
                db.collection(collectionName).findOne({ username: data.username.trim() }, (err, found) => {
                    // console.log(err, found);
                    if (err) {
                        callback(err);
                    } else if (found) {
                        bcrypt.compare(data.password.trim(), found.password, function(err, result) {
                            if (result == true) {
                                // validated = true;
                                callback(null, true, found.role, found.subrole)
                                // console.log(null, true, data.username, found.role, found.subrole)
                            }
                            else {
                                // console.log(null, false, data.username, 'password')
                                callback(null, false, null)
                            }
                        });
                    } else {
                        // console.log(null, false, data.username, 'username')
                        callback(null, false, null)
                    }
                })
            });


  }
};

