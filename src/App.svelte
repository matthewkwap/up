<script>
  import { writable } from "svelte/store";
    import Info from './Info.svelte'
    import Log from './log.svelte'
    
    let authenticated = false;
    let id;
    let sign = false;
    let lo = false;
    let pass;  
    import Loading from './loading.svelte'
   
     let files;
    let dataFile = null;
    let a = localStorage.getItem("auth")
    console.log(authenticated);
    function boo(){
    if(a === "true"){
          authenticated = true;
          lo = true;
        } 
    }
  

    boo();
    async  function user(){
      try {
         let user = {
                 id: id,
                
                
            };
            
            let response = await fetch('http://localhost:4000/newuser', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json;charset=utf-8'
         },
         body: JSON.stringify(user)
        });
        const dat = await response.json()
        console.log(dat);
        
       
        console.log();
        if(dat.created === true){
          authenticated = true;
          lo = true;
        }else{
          authenticated = false
        }
        localStorage.setItem("id",dat.userid.userid);
        localStorage.setItem("dv",dat.db.userid)
        localStorage.setItem("auth", dat.created)
        window.location = "/"
      
        if(!authenticated){
            alert("an error occured while trying to create a new a")

        }
        
        console.log(authenticated);
    
      } catch (error) {
        alert("An Error Occured While Trying To Create =Your Account")
        
      }
       
        
    }
    function sig(){
      sign = true

    }
    function stig(){
      sign = false

    }

    /* 
     */
    
    


   
</script>
 <div>
   
  
  
   {#if !authenticated && !sign }





  
     <form>

    <div id="for">  
          
          <input type="text" placeholder="Create ID" id="demo" name="user" bind:value={id}>
          
          <input type="button" class="submit" value="create" on:click={user}>

     </div>
      </form>
      <button id="de"on:click={sig}>have an existing id</button>
      {:else if sign}
      <Log/> 
      <button id="dem" on:click={stig}  >Sign up</button>
     {:else if !lo}
     <Loading/>

   
     {:else}
     
     <Info/>
     {/if}
     
    
 </div>
 <style>

   #niv{
     width: 50px;
     height: 30px;
     color: #719BE6;
     background-color: #FFFFFF;
   }
    #de {
    border-radius: 10px;
    padding: 10px 15px;
    background-color: rgba(42, 19, 94, 0.432);
    width: auto;
    color: #FFFFFF;
    cursor: pointer;
    border: 1px solid rgba(42, 19, 94, 0.432);
    outline: none;
    display: block;
    margin: 20px auto 20px auto;
  }
  
     #dem {
    border-radius: 100px;
    padding: 10px 15px;
    background-color: rgba(42, 19, 94, 0.432);
    
    color: #FFFFFF;
    cursor: pointer;
    border: 1px solid rgba(42, 19, 94, 0.432);
    outline: none;
    display: block;
    margin: 20px auto 20px auto;
  }
  
.f{
    position: absolute;
    width: 250px;
    height: 400px;
    text-align: center;
    left:30%;
    top: 200px;
}
#demo {
  border-radius: 100px;
  padding: 10px 15px;
  width: 50%;
  border: 1px solid #D9D9D9;
  outline: none;
  display: block;
  margin: 20px auto 20px auto;
}

.submit {
  border-radius: 100px;
  border: none;
  background: #719BE6;
  width: 50%;
  padding: 10px;
  color: #FFFFFF;
  margin-top: 25px;
  box-shadow: 0 2px 10px -3px #719BE6;
  display: block;
  margin: 55px auto 10px auto;
  cursor: pointer;
}

#inp{
  border-radius: 100px;
  border: none;
  background: #719BE6;
  width: 50%;
  padding: 10px;
  color: #FFFFFF;
  margin-top: 25px;
  box-shadow: 0 2px 10px -3px #719BE6;
  display: block;
  margin: 55px auto 10px auto;
  cursor: pointer;
}
#subinp{
  border-radius: 100px;
  border: none;
  background: #719BE6;
  width: 50%;
  padding: 10px;
  color: #FFFFFF;
  margin-top: 25px;
  box-shadow: 0 2px 10px -3px #719BE6;
  display: block;
  margin: 55px auto 10px auto;
  cursor: pointer;
}

 </style>