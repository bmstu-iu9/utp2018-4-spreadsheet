function toLogin() {
    regForm = document.getElementById('reg_form');
    regForm.style.display = 'none';
//    document.body.style.top = '275px';
    document.title = 'Register in Data';
    animateLogin();
}
    
function toRegister() {
    logForm = document.getElementById('log_form');    
    logForm.style.display = 'none';
    document.title = 'LogIn in Data';
//    document.body.style.top = '200px';
    animateRegister();
}
            
function animateLogin() {
    let start = Date.now();
    let timer = setInterval(function() {
        let timePassed = Date.now() - start;
        if (timePassed >= 750) {
            clearInterval(timer);
            return;
        }
        if (timePassed > 0) {
            document.getElementById('log_form').style.display = 'block';
        }
        document.body.style.top = 105 + timePassed/4.5 + 'px';
        document.body.style.opacity = timePassed/750;   
    }, 5)
}
            
function animateRegister() {
    let start = Date.now();
    let timer = setInterval(function() {
        let timePassed = Date.now() - start;
        if (timePassed >= 750) {
            clearInterval(timer);
            return;
        }
        if (timePassed > 0) {
            document.getElementById('reg_form').style.display = 'block';
        }
        document.body.style.top = timePassed / 4.5 + 'px';  
        document.body.style.opacity = timePassed/750; 
    }, 5)
}
