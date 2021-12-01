const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/index')

/* GET home page. */
router.get('/', index_controller.message_list)

// Delete message
router.post('/', index_controller.message_delete_post)

// Sign up form GET
router.get('/sign-up', index_controller.sign_up_get)

// Sign up form POST
router.post('/sign-up', index_controller.sign_up_post)

// Log in form GET
router.get('/log-in', index_controller.log_in_get)

// Log in for POST
router.post('/log-in', index_controller.log_in_post)

// Log out
router.get('/log-out', index_controller.log_out)

// Member form GET
router.get('/member', index_controller.member_get)

// Member form POST
router.post('/member', index_controller.member_post)
 
// Admin form GET
router.get('/admin', index_controller.admin_get)

// Admin form POST
router.post('/admin', index_controller.admin_post)

// Message form GET
router.get('/message', index_controller.message_get)

// Message form POST
router.post('/message', index_controller.message_post)

module.exports = router;
