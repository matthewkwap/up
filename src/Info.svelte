<script>
  import Loading from "./loading.svelte";
  
  
  
      import emotion from 'emotion/dist/emotion.umd.min.js';
      import emo from 'emotion/dist/emotion.umd.min.js';
     
      const {css } = emotion;
     
     
     
    
    let url = "";
      let dat = [];
      
    let loading = true;
      let inputinfo ;
      let set;
      let de; 
      let newinfo;
      let faid = false;
      let bo = css`
      display: none;`;
   
      
      let o = css`
      display:none;
     
      
      `;
      let fai =css`display:none;`
      function close(){
          o = css`
          display:none;
          `;
  
      }
      function sett(id,des){
          set = id;
          de = des
          newinfo = de
         
          console.log(id); 
          o = css`
          
          position:fixed;
          display:block;
          z-index:1;
          width:100%;
          height:100%;
          top: -50px;
          left: 0;
          padding-top: 60px;
          
          background-color:rgba(0, 0, 0, 0.308);
      
          
          
          `;
      }
     
    
  const onSubmitForm = async() =>{
    if(inputinfo.length == 0){
          console.log("hello")
  
      }else{
        let a = localStorage.getItem("dv");
        var d = new Date();
        let me = {
          year:d.getFullYear(),
          month:d.getMonth() + 1,
          day:d.getDate()
          
        }
        try {
         
          let info  = {
            
        descript:inputinfo,
        db:a,
        time:me
      }
          const body = {info};
          
          console.log(a);
          const response = await fetch(`http://localhost:3000/todos/`,{
              method:"POST",
              headers:{'Content-Type':"application/json"},
              body: JSON.stringify(body)
          })
          loading =true;
          inputinfo = "";
          
    
    } catch (error) {
      console.log(error.message)
      } 
      try {
           setTimeout( async() => {
             const response = await fetch(`http://localhost:3000/todos/${a}`);
      const jsonData = await response.json();
      console.log(jsonData);
      dat =  jsonData
      loading = false  
          }, 1000);
       
    } catch (err) {
        console.error(err.message);
    }
  }
  }
  function f(){
      faid = false;
  }
  const getTodos = async () => {
    let a = localStorage.getItem("dv");
      try {
        const response = await fetch(`http://localhost:3000/todos/${a}`);
      const jsonData = await response.json();
      console.log(jsonData);
      dat =  jsonData
        loading = false
        
    } catch (err) {
          fai = `display:block;`
          faid = true
        console.error(err.message);
    }
  }
  const deleteTodo = async id => {
    let a = localStorage.getItem("dv");
      try {
        const deleteTodo = await fetch(`http://localhost:3000/todos/${a}/${id}`, {
          headers: { 'Content-Type': 'application/json'},
          url: 'https://localhost:44346/Order/Order/GiveOrder',
          method: "DELETE"
        });
        loading = true;
  
      
      } catch (err) {
        console.error(err.message);
      }
      try {
       
               const response = await fetch(`http://localhost:3000/todos/${a}`);
      const jsonData = await response.json();
      console.log(jsonData);
      dat =  jsonData
      loading = false
        
       
    } catch (err) {
        console.error(err.message);
    }
    };
    
  const updateDescription = async () => {
     let a = localStorage.getItem("dv");
     let oh = {
     des:newinfo,
     idous:set,
     db:a
     }
     console.log(JSON.stringify(`${oh}`))
     try {
     
     const response = await fetch(
      
       `http://localhost:3000/todos/`,
       {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(oh)
       }
       );
       window.location = '/'
  
    
     } catch (err) {
     console.error(err.message);
     }
   };
  
    getTodos()
  function go(){
    localStorage.clear();
    window.location = '/';
   
  }

  </script>
  <div>
    <article>
  <div>
    <button id="so" on:click={go}>out</button>
  </div>
    
      <div class={o}>
         
          <div class="int" id="animate">
               <button id="cbt"on:click={close} >x</button>
          <button id="ebt"on:click={updateDescription} >Edit!</button>
          <textarea  id="ei" bind:value={newinfo} ></textarea>
          </div>
      
      </div>
      
      
    <h1 id="status"></h1>
    
    <div id="inp">
      <h1 id="p">Todo List</h1>
      <textarea id="text"  type="text" bind:value={inputinfo}  ></textarea>
      <button on:click={onSubmitForm} id="bt">Add</button>
    </div>
    
          {#if loading && !faid}
          <Loading/>
          {:else if faid}
          <div class="fail">
              <h1>faild 👽👽</h1>
              <button id="faild" on:click={getTodos} on:click={f}>Try Again</button>
          </div>
        {:else } 
      <div class="cards">
      {#each dat as g(g.todo_id)}
      <div class="card" >        
        <button
              className="btn btn-danger"
              on:click={() => deleteTodo(g.todo_id)}
              id={g.todo_id,"dbt"}>x</button>
              
                  
            <div id= "mo">
              <h1 id="pd" >{g.description}</h1>
                  
            {#if g.description.includes("http")}
              <embed id="em" type="text/html" src={g.description}  width="auto" height="200">
              {/if}  
        
            </div>
          
           <button id="edt2" on:click={sett(g.todo_id,g.description)} >Edit</button>
              
        </div>
          {/each}
          </div>
          {/if}
        </article>
    
  </div>
  
  <style>
    /* <input class="apple-switch" type="checkbox"> <hr class="ln"> */
      #animate {
    -webkit-animation: animatezoom 0.6s;
    animation: animatezoom 0.6s
  }
  @-webkit-keyframes animatezoom {
    from {-webkit-transform: scale(0)} 
    to {-webkit-transform: scale(1)}
  }
    
  @keyframes animatezoom {
    from {transform: scale(0)} 
    to {transform: scale(1)}
  }
  
  
      #ei{
          position: absolute;
          width:70%;
          height: 106px;
          left: 12.9%;
          top: 11%;
          
          background: #242424;;
          color: rgb(255, 255, 255);
          
          border-radius: 6px;
          
          border-radius: 6px;
          border-radius: 10px;
          resize: none;
              
              font-size: 12px;
              text-align: start;
              -o-text-overflow: clip;
              text-overflow: clip;
              letter-spacing: 3px;
              box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
              border-style: unset;
              outline: none;
              
      }
      hr.ln{
    border: 1px solid rgb(179, 179, 179);
    border-radius: 5px;
  }

  #em{
    max-width: 80%;
    
    height:100px;
  }
      .int{
      
          position: absolute;
          width: 70%;
          height:30%;
          left:10%;
          z-index: 3;
          border-radius: 10px;
          top: 30%;
          text-align: center;
      padding: 1em;
      
          margin: 0 auto;
          background-color: rgba(15, 15, 15, 0.788);
  
      }
     /* #status{
          position:fixed;
          display:block;
          z-index:3;
          width:100%;
          height:100%;
          top: -50px;
          left: 0;
          padding-top: 60px;
          
          background-color:rgba(0, 0, 0, 0.308);
      }*/
      .fail{
          
      text-align: center;
      padding: 1em;
      max-width: 240px;
      margin: 0 auto;
    
      }
      #bt{
          width: 20%;
          height: 20px;
          left: 58.9%;
          top: 30%;
          
          border: solid 1px rgba(255,255,255,0.3);
      backgroud-clip: padding-box;
      backdrop-filter: blur(20px );

          
          background: #FFC2C2;
          border-radius: px;
          background-color:rgb(30, 38, 153) ;
             
              
            height: 42px;
            font-family: 'Roboto', sans-serif;
            font-size: 11px;
            letter-spacing: 1.5px;
            font-weight: 650;
            color: white;
            background-color: #244dbd63;
            border: none;
            border-radius: 7px;
            box-shadow: 3px 3px 6px rgb(85, 85, 85);
            
            transition: all 0.3s ease 0s;
            cursor: pointer;
            outline: none; 
          
      }
      /*#bt:hover{
        animation: flt 5s ease-in-out infinite;
      }*/
      #faild{
          width: 27%;
          height: 20px;
          left: 58.9%;
          top: 30%;
          
          
          
          background: #FFC2C2;
          border-radius: px;
          background-color:rgb(20, 23, 54) ;
             
              
            height: 42px;
            font-family: 'Roboto', sans-serif;
            font-size: 11px;
            letter-spacing: 1.5px;
            font-weight: 650;
            color: white;
            background-color: #244dbd;
            border: none;
            border-radius: 7px;
            box-shadow: 3px 3px 6px rgb(85, 85, 85);
            
            transition: all 0.3s ease 0s;
            cursor: pointer;
            outline: none; 
          
      }
      #ebt{
          position: absolute;
          width: 40%;
          height: 40px;
          left: 28.9%;
          box-shadow: 3px 3px 6px rgb(85, 85, 85);
            
          top: 70%;
          
          
          
          background: #FFC2C2;
         
         
              
           
          font-family: 'Roboto', sans-serif;
          font-size: 11px;
          letter-spacing: 1.5px;
          font-weight: 650;
          color: white;
          background-color: rgb(63, 62, 62);
          
            border: none;
            border-radius: 7px;
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease 0s;
            cursor: pointer;
            outline: none; 
          
      }
      #cbt{
          position: absolute;
          width: 10%;
          height: 30px;
          left: 89.9%;
          top: 1%;
          
          
          
          background: #FFC2C2;
         
        
          box-shadow: 3px 3px 6px rgb(85, 85, 85);
            
           
            font-family: 'Roboto', sans-serif;
            font-size: 11px;
            letter-spacing: 1.5px;
            font-weight: 650;
            color: white;
            background-color: #25304e79;
            border: none;
            border-radius: 7px;
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease 0s;
            cursor: pointer;
            outline: none; 
          
      }
      
      #dbt{
          box-shadow: 0px 8px 15px rgba(34, 33, 33, 0.11);
          position: relative;
         
      
      border: solid 1px rgba(255,255,255,0.3);
      backgroud-clip: padding-box;
      backdrop-filter: blur(20px );






          width: 30px;
          height: 30px;
          left: -49.9%;
          top: -15px;
          font-family: 'Roboto', sans-serif;
          font-size: 11px;
          letter-spacing: 1.5px;
          font-weight: 650;
          color: white;
          background-color: rgba(63, 62, 62, 0.048);
          border: none;
          border-top-left-radius: 5px;
         /* border-radius: 100px;*/
          
          transition: all 0.3s ease 0s;
          cursor: pointer;
          outline: none; 
  }
  #edt2{
          position: relative;
          width: 20%;
          height: 25px;
       
          /*
          background-color: #244dbd;
          left: -13%;
          top: 1px;*/
          font-family: 'Roboto', sans-serif;
          font-size: 11px;
          letter-spacing: 1.5px;
          font-weight: 650;
          color: white;
          background-color: rgb(63, 62, 62);
          
            border: none;
            border-radius: 7px;
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease 0s;
            cursor: pointer;
            outline: none; 
  }
     #p{
         color: rgb(226, 234, 241);
         animation: float 10s ease-in-out infinite;
         text-shadow: 3px 3px 6px rgb(65, 63, 63);
     }
     #pd{
         color: aliceblue;
         text-shadow: 3px 3px 6px rgb(85, 85, 85);
         white-space: pre-wrap;
         word-wrap: break-word;
         
     }
      #so{
        position:absolute;
        width: 56.9px;
          height: 20px;
          
          top:5px;
          
          
          
          
          background: #FFC2C2;
          border-radius: px;
          background-color:rgb(65, 63, 63);
             
              
            
            font-family: 'Roboto', sans-serif;
            font-size: 11px;
            letter-spacing: 1.5px;
            font-weight: 650;
            color: white;
           
            border: none;
            border-radius: 7px;
            box-shadow: 3px 3px 6px rgb(85, 85, 85);
            
            transition: all 0.3s ease 0s;
            cursor: pointer;
            outline: none; 
      }
    .edt{
      display: none;
    }
  #text{
  width:100%;
  height: 115px;
  left: 10.9%;
  top: 31%;
   resize: none;
   
  background: #24242449;
  color: rgb(255, 255, 255);
  
  border-radius: 6px;
  
  border-radius: 6px;
  border-radius: 10px;
 
      padding: 20px;
    
      border: solid 1px rgba(0, 0, 0, 0.356);
      backgroud-clip: padding-box;
      backdrop-filter: blur(0.1px );




      font-size: 15px;
      text-align: start;
      -o-text-overflow: clip;
      text-overflow: clip;
      letter-spacing: 3px;
      box-shadow: -4px 3px 6px rgb(0 0 0 / 51%);
      border-color:#303030;
     outline: none;
  }
  
  .cards {
        max-width:100%;
        height:auto;
      margin: 0 auto;
      display:grid;
      grid-gap: 1rem;
      
      }
    .card {
      padding: 20px;
      background: rgba( 255, 255, 255, 0.2 );
      border: solid 1px rgba(255,255,255,0.3);
      backgroud-clip: padding-box;
      backdrop-filter: blur(20px );

      
        align-items: center;
        text-align: center;
        border-radius: 20px;
        background-color: rgba(48, 47, 47, 0.281);
        color: black;
        padding: 1rem;
        height:auto;
        width:auto;
        
        
        align-items: center;
      box-shadow: 1px 2px 7px rgba(179, 214, 255, 0.753);
       grid-auto-flow: row;
       border: none;
       border-radius: 7px;
       box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
      
         transition: all 0.3s ease 0s;
        outline: none; 
      }
    .card:hover{
      transform: translatey(-1px);
      opacity: 1.2;
    
      
    }
   
    @media (min-width: 800px) {
        .cards { 
             grid-auto-flow: row; 
             max-width:50%
        }
       
        
        
      }
      @media (max-width: 900px) {
        .cards { 
             grid-auto-flow: row; 
             width:70%
        }
       
       
        #ei{
            width:60%;
            left: 20%;
            height: 136px;
        }
        .int{
            width: 50%;
            height:40%;
            left:20%;
            top: 30%;
        }
    
      }
      
   
     
      
      
      @media (max-width: 400px) {
      
       
        .cards {
             grid-auto-flow: row;
             
    
        }
       
        #pd{
            font-size: 20px;
            white-space: pre-wrap;
        }
        #ei{
            width:70%;
            left: 15%;
            height: 100px;
        }
        #ebt{
            width: 40%;
            height: 40px;
            left: 28.9%;
            top: 55%;
        }
        .int{
            width: 60%;
            height:30%;
            left:20%;
            top: 30%;
        }
      }
    
    
  
  .g {
      text-align: center;
      padding: 1em;
      max-width: 240px;
      margin: 0 auto;
    }
  
    #inp {
      text-align: center;
      padding: 1em;
      max-width: 500px;
      margin: 0 auto;
    }
  /*
    h1 {
      color: #ff3e00;
      text-transform: uppercase;
      font-size: 4em;
      font-weight: 100;
    }
  
    @media (min-width: 640px) {
      main {
        max-width: none;
      }
    }*/
      input.apple-switch {
    position: relative;
    -webkit-appearance: none;
    outline: none;
    width: 50px;
    height: 30px;
    background-color: #fff;
    border: 1px solid #D9DADC;
    border-radius: 50px;
    box-shadow: inset -20px 0 0 0 #fff;
  }
  
  input.apple-switch:after {
    content: "";
    position: absolute;
    top: 1px;
    left: 1px;
    background: transparent;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    box-shadow: 2px 4px 6px rgba(0,0,0,0.2);
  }
  
  input.apple-switch:checked {
    box-shadow: inset 20px 0 0 0 #00f396;
    border-color: #00bdd6;
  }
  
  input.apple-switch:checked:after {
    left: 20px;
    box-shadow: -2px 4px 3px rgba(0,0,0,0.05);
  }
  @keyframes flt {
      0% {
          
          
          
          background-color: rgb(238, 1, 1);
      
      }
      15%{
          background-color: rgb(255, 238, 7);
  
      }
      25%{
          background-color: rgb(26, 250, 6);
  
      }
      50% {
          
        
         
          background-color: rgb(5, 71, 255);
      
      }
      75%{
          background-color: rgb(247, 6, 235);
  
      }
      85%{
          background-color: rgb(255, 0, 21);
      }
  
      100% {
          
         
         
          background-color: rgb(94, 94, 94);
      
      }
  }
  
  @keyframes flot {
      0% {
          
          
          
          color: rgb(255, 255, 255);
      
      }
      15%{
          color: rgb(245, 140, 255);
  
      }
      25%{
          color: rgb(255, 255, 113);
  
      }
      50% {
          
        
         
          color: rgb(108, 255, 132);
      
      }
      75%{
          color: rgb(255, 102, 102);
  
      }
      85%{
          color: rgb(123, 125, 255);
      }
  
      100% {
          
         
         
          color: rgb(255, 255, 255);
      
      }
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
  }
  
  .navbar {
    
       
    width: 10%;
    height:20px;
    overflow: hidden;
    background-color: #333;
  }
  
  
  .dropdown {
    color: white;
    float: left;
    overflow: hidden;
  }
  
  .dropdown .dropbtn {
    font-size: 16px;  
    
    border: none;
    outline: none;
    color: white;
    padding: 14px 16px;
    background-color: inherit;
    font-family: inherit;
    margin: 0;
  }
  
  .navbar a:hover, .dropdown:hover .dropbtn {
    background-color: red;
  }
  
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #d3d2d2;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }
  
  .dropdown-content button {
    float: none;
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    text-align: left;
  }
  
  
  .dropdown:hover .dropdown-content {
    display: block;
  }
  #ic{
    width:auto;
    height: auto;
    color: white;
    background-color: #244dbd;
    border: none;
    border-radius: 7px;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease 0s;
    cursor: pointer;
    outline: none; 
  }
  @keyframes float {
              0% {
                  
                  transform: translatey(0px);
              }
              50% {
                  
                  transform: translatey(-20px);
              }
              100% {
                  
                  transform: translatey(0px);
              }
          }
          
  </style>