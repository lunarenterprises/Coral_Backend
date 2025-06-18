
var db = require('../db/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.AddimageQuery =async(imagepath)=>{
    var Query =`insert into status(st_image)values(?);`
    var data= query(Query,[imagepath]);
    return data;
}
module.exports.listStatusQuery=async()=>{
    var Query =`select * from status ;`
    var data= await query(Query);
    return data;

}
module.exports.checkStatusQuery =async(st_id)=>{
    var Query= `select * from status where st_id=?`;
    var data =await query(Query,[st_id]);
    return data ;
}
module.exports.removeStatusQuery =async(st_id)=>{
    var Query =`delete from status where st_id=?`
    var data =await query (Query,[st_id]);
    return data;
}
