const electron = require('electron');

const {ipcRenderer} = electron;

const createAdminBtn = document.querySelector('#admin-form');
const createCashierBtn = document.querySelector('#cashier-form');

createAdminBtn.addEventListener('submit', submitAdmin);
createCashierBtn.addEventListener('submit', submitCashier);

function submitAdmin(e){
    e.preventDefault();
    const adminPassword = document.querySelector('#admin-password').value;
    if (adminPassword !== ''){
        createAdminBtn.setAttribute('hidden', '');
        ipcRenderer.send('createAdmin', adminPassword);
    }
}

function submitCashier(e){
    e.preventDefault();
    const cashierPassword = document.querySelector('#cashier-password').value;
    if (cashierPassword !== ''){
        createCashierBtn.setAttribute('hidden', '');
        ipcRenderer.send('createCashier', cashierPassword);
    }
}

ipcRenderer.on('succeed', () => {
    console.log('succeed');
})


