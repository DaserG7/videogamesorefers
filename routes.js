var express = require("express");
var Zombie = require("./models/zombie");
var Weapon = require("./models/equipment");
var pdf = require('pdfkit');

var passport = require("passport");
var acl = require("express-acl");

var router = express.Router();

acl.config({
    baseUrl:'/',
    defaultRole:'zombie',
    decodedObjectName:'zombie',
    roleSearchPath:'zombie.role'
    
});

router.use(acl.authorize);

router.use((req,res,next)=>{
    res.locals.currentZombie = req.zombie;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.isAuthenticated()){
        req.session.role = req.zombie.role;
    }
    console.log(req.zombie);
    next();
});

router.get("/",(req,res,next)=>{
    Zombie.find()
    .sort({createdAt: "descending"})
    .exec((err,zombies)=> {
        if(err){
            return next(err);
        }
        res.render("index",{zombies: zombies});
    });  
});

router.get("/signup",(req,res)=>{
    res.render("signup");
});

router.post("/signup",(req,res,next)=>{
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;
    Zombie.findOne({username:username},(err,zombie)=>{
        if(err){
            return next(err);
        }
        if(zombie){
            req.flash("error","El Nick de Empleado ya esta en uso");
            return res.redirect("/signup");
        }
        var newZombie = new Zombie({
            username:username,
            password:password,
            role: role
        });
        newZombie.save(next);
        return res.redirect("/");
    });

});
router.get("/zombies/:username",(req,res,next)=>{
    Zombie.findOne({username:req.params.username},(err,zombie)=>{
        if(err){
            return next(err);
        }
        if(!zombie){
            return next(404);
        }
        res.render("profile",{zombie:zombie});
    });
});

router.get("/createbook",(req,res)=>{
    res.render("createbook");
});

router.post("/createbook",(req,res,next)=>{
    var description = req.body.description; 
    var power = req.body.power
    var category = req.body.category;
    var genero = req.body.genero; 

    var newWeapon = new Weapon({
        description: description,
        power: power,
        category: category,
        genero: genero
    }); 
    newWeapon.save(next);
    return res.redirect("/libros");
    
});

router.get("/libros",(req,res,next) =>{
    Weapon.find()
        .sort({ createdAt: "descending"})
        .exec((err,libros) =>{
            if(err){
                return next(err);
            }
            res.render("libros",{libros: libros});
        });
});

router.get("/login",(req,res)=>{
    res.render("login");
});

router.post("/login",passport.authenticate("login",{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash: true
}));
router.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});


router.get("/edit",ensureAuthenticated, (req,res)=>{
    res.render("edit");
});

router.post("/edit", ensureAuthenticated,(req,res,next)=>{
    req.zombie.displayName = req.body.displayName;
        req.zombie.bio = req.body.bio;
        req.zombie.save((err)=>{
            if(err){
                next(err);
                return;
            }
            req.flash("info","Nick Actualizado");
            res.redirect("/edit");
        });
});
router.post("/createpdf", (req,res,next) => {
    var titulo1 = req.body.titulo1;
    var titulo2 = req.body.titulo2;
    var titulo3 = req.body.titulo3;
    var titulo4 = req.body.titulo4;
    var myDoc = new pdf();
    var stream = myDoc.pipe(fs.createWriteStream('img/'+tituloi+'pdf'));
    if((titulo1+'.pdf') != myDoc.pipe(fs.createWriteStream('img/'+titulo1+'.pdf'))){
    
    myDoc.fontSize(10).text('Publicacion: '+titulo1, 100, 120);
    myDoc.font('Times-Roman').fontSize(10).text('Categoria:'+titulo2,100 , 140);
    myDoc.fontSize(10).text('Fecha: '+titulo3, 100, 160);
    myDoc.end();
    return res.redirect("/libros");
    }else{
    
        req.flash("error", "Este Juego ya se ha guardado");
        return res.redirect('/img/'+titulo1+'.pdf');
    }
});



function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("info","Necesitas ingresar tu Nick para poder ver esta sección");
        res.redirect("/login");
    }
}

module.exports = router;