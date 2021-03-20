const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(express.static('Public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb+srv://admin-ruchika:test-123@cluster0.ov7l5.mongodb.net/sparks", { useUnifiedTopology: true , useNewUrlParser: true , useFindAndModify: false });

const customerSchema = {
  name: String,
  email:String,
  age: Number,
  balance:Number
}

const tranSchema = {
  time: String,
  date: String,
  from: {type:String, required:true},
  to: {type:String, required:true},
  amt: Number
}

const Cust = mongoose.model('customer',customerSchema);
const Tran = mongoose.model('transaction',tranSchema);

const cust1 = new Cust({
name:"Asha",
email:"asha@gmail.com",
acc_type:"saving",
age:42,
balance:23000
});



// Cust.insertMany([cust1,cust2,cust3,cust4,cust5,cust6],function(err){
//   if(err){
//   console.log(err);
// }
// else{
//   console.log("successfully added");
// }
//  });
let Customers;

function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i]._id == nameKey) {
            return myArray[i];
        }
    }
}


app.get('/',function(req,res){

  res.render('home');
});

app.get('/customer',function(req,res){

    Cust.find({},function(err,item){
      if(err){
        console.log(err);
      }
      else{
        Customers = item;
        res.render('cust', {customers:Customers});
      }
    });



});

app.get('/transaction',function(req,res){

    Tran.find({},function(err,item){
      if(err){
        console.log(err);
      }
      else{
        res.render('transactions', {trans:item});
      }
    });

});

app.get('/customer/:custname',function(req,res){
  Cust.findById(req.params.custname,function(err,item){
    if(err){
      console.log(err);
    }
    else{
       res.render('transfer',{item:item,customers:Customers});
    }
  });
  });

app.post('/transfer/:custname',function(req,res){

  const d = new Date();
  const new_date =`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  const new_time = `${d.getHours()}:${d.getMinutes()}`;
  const FromCust = search(req.params.custname,Customers);
  const ToCust = search(req.body.to,Customers);

if(FromCust && ToCust){
  const trans1 = new Tran({
              time: new_time,
              date: new_date,
              from:FromCust.name,
              to: ToCust.name,
              amt: req.body.amount
            });
            Tran.insertMany([trans1],function(err){
              if(err){console.log(err)}

            });
              Cust.findByIdAndUpdate(ToCust._id,{$inc:{balance : req.body.amount}},function(err,result){
                if(err){console.log(err);}

              });

              Cust.findByIdAndUpdate( FromCust._id ,{$inc:{balance : (req.body.amount*-1)}},function(err,result){
                if(err){console.log(err);}

              });
              res.redirect('/successfull');



}
else{
  console.log("from or to not found");
}



});

app.get('/successfull',function(req,res){
  res.render('tranSuccess');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port ,()=>{
console.log('running...');
});
