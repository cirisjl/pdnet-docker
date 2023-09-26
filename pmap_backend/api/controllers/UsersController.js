/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
	getRole: (req, res) => {
		if (!req.body.username || !req.body.password) {
			return res.badRequest({ message: 'parameter missing' })
		} else {
			Users.validateUser(req.body, (err, validated, role) => {
				if (err) {
					return res.serverError(err)
				} else {
					return res.json({ validated: validated, role: role })
				}
			})
		}
	}
};

