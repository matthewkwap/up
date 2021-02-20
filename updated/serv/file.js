const express = require('express')
const app = express()
const cors= require('cors')
const pool = require('./db')
const ndeb = require('./newdb')
let idd;

//middleware
app.use(cors())
app.use(express.json())

//`CREATE TABLE map(user_id SERIAL PRIMARY KEY,usern VARCHAR(255),pass VARCHAR(255));`

async function create(){
    try {
        //"INSERT INTO tod (description) VALUES($1) RETURNING *",["matthew"]
        let all = "SELECT * FROM users"
        let create ="CREATE TABLE  todo_id SERIAL PRIMARY KEY,description VARCHAR(255),pending VARCHAR(255)"
      //"UPDATE Uer SET password = $1 WHERE id = $2 RETURNING *", ["kmatthew","matthew"]
            const newTodo = await pool.query("CREATE TABLE u( userid VARCHAR(255))");
            //let newt = await pool.query("UPDATE tod SET usern = $1 WHERE user_id = $2", [description.des,description.idous])
            //const newTodo = await pool.query("INSERT INTO tod (description) VALUES($1) RETURNING *",[description.info.descript]);
            console.log(newTodo.rows)

         
     } catch (error) {
         console.log(error.message)
         
     }
}





//ROUTES//
app.post('/newuser',async (req,res)=>{
    try {
         let a  = {
        id:req.body.id
    }
    idd = a.id
    const nt  = await pool.query(`CREATE TABLE ${a.id}(
        todo_id SERIAL PRIMARY KEY,
        description VARCHAR(255),
        time VARCHAR(255)
        
    );`)
    const newTodo = await pool.query("INSERT INTO u (userid) VALUES($1) ",[a.id]);
    const t = await pool.query(`SELECT * FROM u WHERE userid = $1`,[a.id])

    let bob = {
        userid:t.rows[0],
        db:t.rows[0],
        created:true
    }
    res.json(bob)
    console.log(t.rows[0]);
    } catch (error) {
        console.log(error);
        let bob = {
            created:false
        }
        res.json(bob)
    }
   
   
})
app.post('/auth', async(req,res) =>{
    try {
        let a = {
        id:req.body.id
    }
    let r = a.id
    console.log(r);
      
    i = await pool.query(`SELECT * FROM u WHERE userid = $1`,[a.id]); 
    let i1 =  i.rows[0].userid
    if(i1 === a.id){
    let bob = {
        userid:i.rows[0].userid,
        db:i.rows[0].userid,
        authenticated:true
    }
     res.json(bob)
    }

    } catch (error) {
        console.log("erroffr" + error)
         let bb = {
            authenticated:false
        }
        res.json(bb)  
        
    }

    
    

})
app.get('/y', async(req,res) =>{
    let all = "SELECT * FROM u"
    const newTodo = await pool.query(all);
    let a = newTodo.rows;
    res.json(a)

})

//get user info and authenticate
app.post('/a/', async(req,res) =>{
    try {
        let a  = {
        id:req.body.id,
       
        
      }
     
      let i =  newTodo = await pool.query(`SELECT * FROM u WHERE userid = $1`,[id]); 
      let i1 =  i.rows[0].id
      console.log(a.id);
      console.log(i1);
      console.log(i2);
     if(a.id == i1 && a.password == i2){
         let retured = {
             authenticated:true
         }
         console.log("succes");
         res.json(retured)
         
    }
    } catch (error) {
         let returned = {
            authenticated:false
        }
        console.log("failed");
        res.json(returned)
    }
   
})


// CREATE ATODO
app.post('/todos', async(req,res) =>{
    try {
       const description = req.body;
       console.log(description)
       const newTodo = await pool.query(`INSERT INTO ${description.info.db} (description) VALUES($1) RETURNING *`,[description.info.descript]);
      // const newt = await pool.query("INSERT INTO tod (time) VALUES($1) RETURNING *",[description.info.Time]);
       res.json(newTodo.rows )

        
    } catch (error) {
        console.log(error.message)
        
    }

}) 



//GET ALL TODO

app.get('/todos/:db', async(req,res) =>{
    try {
        let id = req.params;
       let r = id.db
       const allTodos = await pool.query(`SELECT * FROM ${r} `) 
       res.json(allTodos.rows)
       
        
    } catch (error) {
        console.log(error.message)
        
    }

})
app.get('/:id/:db',(req,res) =>{
    const {id,db} = req.params;
    console.log(id,db);
})
//get a todo
app.get("/todos/:db/:id", async(req,res) =>{
    try {
        const {id,db} = req.params;
     const todo = await pool.query(`SELECT * FROM ${db} WHERE todo_id = $1`,[id])

     res.json(todo.rows[0])
        
    } catch (error) {
        console.log(error.message)
    }
})




//UPDATE TODO
app.put('/todos/', async (req,res) =>{
    try {
        const {db,id} = req.params;
      
        
        const description = req.body
    
        console.log(description)
        const updatetodo = await pool.query(`UPDATE ${description.db} SET description = $1 WHERE todo_id = $2`, [description.des,description.idous])
       
        res.json("todo was updated")
    } catch (error) {  
        console.log(error.message) 
    }

})


app.delete('/todos/:db/:id', async(req,res) =>{
    try {
        const {db,id} = req.params;
        const deleteTodo = await pool.query(`DELETE FROM ${db} WHERE todo_id = $1`, [id])
        res.json("it wass deleted")        
    } catch (error) {
        console.log(error.message)
    }
})


//DELETE A TODO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
