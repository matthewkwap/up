<script>
    import { writable } from "svelte/store";
      import Info from './Info.svelte'
      
      let authenticated = true;
      let id;
      let lo = true;
      let pass;  
      import Loading from './loading.svelte'
     /*
      let l = localStorage.getItem("log");
      let l1 = localStorage.getItem("log1");
      let l2 = localStorage.getItem("log2");
      let l3 = localStorage.getItem("log3");
      let l4 = localStorage.getItem("log4");
      function boo(){
      if(l == "adj1oj4nrofri59onvfdvd"&& l1=="adj1oj4nrovd" && l2 == "adj159onvfdvd" && l3 =="adj1oj4nr9onvfdvd" && l4 == "adj1orofri59onvfdvd"){
            authenticated = true;
            lo = true;
          } 
      }
      function auth(){
        let user = {
            id: id,
            password:pass
          };
         
        if(user.id == "matthew" && user.password == "matthew"){
          authenticated = true
          lo = true
          console.log("succes");
          localStorage.setItem("log","adj1oj4nrofri59onvfdvd");
          localStorage.setItem("log1","adj1oj4nrovd");
          localStorage.setItem("log2","adj159onvfdvd");
          localStorage.setItem("log3","adj1oj4nr9onvfdvd");
          localStorage.setItem("log4","adj1orofri59onvfdvd");
          
    
        }else{
          console.log("failed");
          alert("your inputs are wrong")
        }
      }
      boo();*/
      async  function user(){
          let user = {
                   id: id,
                  
                  
              };
              let response = await fetch('http://localhost:3000/auth', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json;charset=utf-8'
           },
           body: JSON.stringify(user)
          });
          const dat = await response.json()
          console.log(dat);
          
          authenticated =  dat.authenticated
          localStorage.setItem("auth", dat.authenticated)
          localStorage.setItem("id",dat.userid);
        localStorage.setItem("dv",dat.db)
         
          if(!authenticated){
              alert("your account wasnt recognised")
  
          }
          
          console.log(authenticated);
          window.location = "/"
          
      }
  </script>
   <div>
       
   
       <form>
      <div id="fored">
            <input type="text" placeholder="Identification info" id="demo" name="user" bind:value={id}>
          
            <input type="button" class="submit" value="log in" on:click={user}>
  
       </div>
        </form>
      
       
   </div>
   <style>
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
  #dem {
    border-radius: 100px;
    padding: 10px 15px;
    width: 20%;
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
  
   </style>