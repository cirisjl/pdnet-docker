/**
 * GenesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getNames: (req, res) => {
        // res.set('Content-Type', 'text/event-stream');
        let collectionName = req.allParams().collectionName;
        let dbName = req.allParams().dbName;
        // console.log('table name:', collectionName);
        Genes.getNames(dbName, collectionName, (err, resp) => {
            if (err) {
                return res.serverError(err);
            } else {
                return res.json(resp);
            }
        })
    },

};