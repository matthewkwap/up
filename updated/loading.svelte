<script></script>
<div class="loading">
    <div id="p1"></div>
    <div id="p2"></div>
    <div id="p3"></div>
</div>
<style>
    .loading{
    text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
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
        
        
    #p1{
        position: absolute;
        left: 45%;
        width: 10px;
        height: 10px;
        background-color: black;
        border-radius: 20px;   
        animation: float 2.3s ease-in-out infinite;
    }
    #p2{
        position: absolute;
        left: 50%;
        width: 10px;
        height: 10px;
        background-color: black;
        border-radius: 20px;   
        animation: float 2.6s ease-in-out infinite;
    }
    #p3{
        position: absolute;
        left: 55%;
        width: 10px;
        height: 10px;
        background-color: black;
        border-radius: 20px;   
        animation: float 2.9s ease-in-out infinite;
    }
</style>