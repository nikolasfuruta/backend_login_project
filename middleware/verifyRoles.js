const verifyRoles = (...allowedRoles) => {
  //allowedRoles are the autorization
  //req.roles are user permission
  return (req,res,next) => {
    if(!req?.roles) return res.sendStatus(401);
    const rolesArray = [...allowedRoles];

    const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true)//[false,true,false,etc]

    if(!result) return res.sendStatus(401);
    next();
  }
}

module.exports = verifyRoles