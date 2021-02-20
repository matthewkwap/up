<script>
   async  function user(){
        let user = {
                 id: id,
                 
            };
        let response = await fetch('http://localhost:3000/newuser', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
         body: JSON.stringify(user)
        });
       
        console.log(response.Response);
         
        
    }
</script>
<div></div>
<style></style>