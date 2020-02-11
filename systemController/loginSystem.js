const electron = require('electron');

const {ipcRenderer} = electron;

const loginBtn = document.querySelector('form');
const errorMessage = document.querySelector('.card-action');

ipcRenderer.on('error', (e, err) => {
    errorMessage.removeAttribute('hidden');
    M.toast({html: err, classes: 'red darken-2'});
});

loginBtn.addEventListener('submit', submitForm);

function submitForm(e){
    e.preventDefault();
    const userName = document.querySelector('#username').value;
    const passWord = document.querySelector('#password').value;
    ipcRenderer.send('user:login', userName, passWord);
}

