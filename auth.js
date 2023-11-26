const jwt=require('jsonwebtoken');

const auth=async(req,res,next)=>{
    let {token}= req.cookies;
    console.log(`req.cookies is ${req.cookies}`)
    console.log(`token of req.cooki is  ${token}`)
    if(!token){
    res.redirect('/login')
    }
    else{
        let verified= await jwt.verify(token,'zeenath@7144');
        req.user=verified._doc;
        next();
    }
};
module.exports=auth;