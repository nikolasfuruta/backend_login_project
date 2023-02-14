const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/employeeController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

//quando eu entro aqui, já realizei o login e possuo em 'mão' o access token
router.route('/')
  .get(employeeController.getAllEmployees)
  .post(verifyRoles(ROLES_LIST.Admin),employeeController.createNewEmployee)//set permission to Admin and Editor
  .put(verifyRoles(ROLES_LIST.Admin,ROLES_LIST.Editor),employeeController.updateEmployee)
  .delete(verifyRoles(ROLES_LIST.Admin),employeeController.deleteEmployee);

router.route('/:id')
  .get(employeeController.getEmployee)

module.exports = router;