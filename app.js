const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");




const app = express();

// created global variable to access it anywhere


//its used to access ejs file inside the views folder
app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({
  extended: true
}));

//used to allow css files inside public folder on server
app.use(express.static("public"));

//mongoose connecting to the server
//make sure no spelling mistakes
mongoose.connect("");

//items schema new database
const itemsSchema = {
  name: String,
}
//collections using mongoose for itemsSchema
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to todo list",

});

const item2 = new Item({
  name: "welcome to todo list",

});

const item3 = new Item({
  name: "welcome to todo list",

});

//list to store the values items
const defaultItems = [item1, item2, item3];


//new listschems database
const listSchema = {
  name: String,
  items: [itemsSchema]
};
//collections using mongoose for listSchema database
const List = mongoose.model("List", listSchema);

//get method to store the list items from defaultItems to database
app.get('/', function(req, res) {

  Item.find({}, function(err, founditems) {
    if (founditems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("success to save defaultitems to db")
        }
      });

      //after inserting values to database from defaultItems it redirects to home
      res.redirect("/");

    } else {
      res.render('list', {
        listTitle: 'Today',
        newListitems: founditems,
      });

    }
  })

  // it renders the values from ejs files

});
//to change the title too after rendering localhost:3000/anyname
app.get("/:customListname", function(req, res) {
  const customListname = _.capitalize(req.params.customListname);

  List.findOne({
    name: customListname
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListname)
      } else {
        //show existing link

        res.render("list", {
          listTitle: foundList.name,
          newListitems: foundList.items,
        })

      }
    }
  })

})

app.post('/', function(req, res) {
  //it helps to locate the perticular attribute in body
  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName,
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name:listName}, function(err, foundList){

      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }

});

app.post('/delete', function(req, res) {
  const checkItemId = req.body.checkBox;

  const listName = req.body.listName;


  if (listName === 'Today') {
    Item.findByIdAndRemove(checkItemId, function(err) {
      if (!err) {
        console.log("successfully deleted checked item")
        res.redirect('/');
      };
    });
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkItemId
          }
        }
      },
      function(err, foundList) {
        if (!err) {
          res.redirect("/"+listName)
        }
      })


  }

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}





app.listen(port, function() {
  console.log('server has started and is up and running');
});
