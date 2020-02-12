const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain} = electron;
// require('electron-reload')(__dirname);

let mainWindow;
const userDataJSON = './data/userData.json';
const dataBarangJSON = './data/dataBarang.json';
let userData = {
    admin: '',
    cashier: '',
};

let dataBarang = [];

const perbiji = {
    lusin: 12,
    rim: 500
}

const pesan = {
    error: 'red',
    success: 'green'
}

//Listen for app to be ready
app.on('ready', () => {
    //create new window
    mainWindow = new BrowserWindow({width: 1000, height: 500, webPreferences: {nodeIntegration: true, experimentalFeatures: true}});
    //Load the main window
    if (fs.existsSync(userDataJSON)){
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'admin.html'),
            protocol: 'file',
            slashes: true
        }));
    } else {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'createUser.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    // garbage collection
    mainWindow.on('close', () => {
        mainWindow = null;
    });

    //create new menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //inserting menu to app
    Menu.setApplicationMenu(mainMenu);
    mainWindow.toggleDevTools();
    // if dataBarang.json exist, update dataBarang array
    if (fs.existsSync(dataBarangJSON)){
        dataBarang = require(dataBarangJSON);

        // if web contents is fully loaded, send the dataBarang
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('warehouse-data', dataBarang);
        });
    }
});

// catch create user data
ipcMain.on('createAdmin', function (e, adminPassword){
    userData.admin = Buffer.from(adminPassword, 'binary').toString('base64');
    if (userData.cashier !== ''){
        const userDataRaw = JSON.stringify(userData);
        fs.writeFile('./data/userData.json', userDataRaw, (err) => {
            console.log(err);
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'login.html'),
                protocol: 'file',
                slashes: true
            }));
        });
    }
});
ipcMain.on('createCashier', function(e, cashierPassword){
    userData.cashier = Buffer.from(cashierPassword, 'binary').toString('base64');
    if (userData.admin !== ''){
        const userDataRaw = JSON.stringify(userData);
        fs.writeFile('./data/userData.json', userDataRaw, (err) => {
            console.log(err);
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'login.html'),
                protocol: 'file',
                slashes: true
            }));
        });
    }
});

// catch login data
ipcMain.on('user:login', function(e, userName, passWord){
    userData = require('./data/userData.json');
    if (userName === 'admin' && passWord === Buffer.from(userData.admin, 'base64').toString('binary')){
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'admin.html'),
            protocol: 'file',
            slashes: true
        }));
    } else if (userName === 'cashier' && passWord === Buffer.from(userData.cashier, 'base64').toString('binary')){
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'cashier.html'),
            protocol: 'file',
            slashes: true
        }));
    } else {
        mainWindow.webContents.send('error', 'Username atau Password yang anda masukkan salah!');
    }
});

// add some stuff to warehouse
ipcMain.on('tambah-barang', function(e, kode, nama, jumlah, kuantitas, hargaSatuan){
    if (fs.existsSync(dataBarangJSON)){
        kumpulanKodeBarang = [];
        dataBarang = require(dataBarangJSON);
        for (let i = 0; i < dataBarang.length; i++){
            kumpulanKodeBarang.push(dataBarang[i].kode);
        }
        if(!kumpulanKodeBarang.includes(kode)){
            tambahBarang(kode, nama, jumlah, kuantitas, hargaSatuan);
            mainWindow.webContents.send('stock-data', dataBarang);
            mainWindow.webContents.send('pesan', `Barang dengan kode ${kode} berhasil ditambahkan`, pesan.success);
        } else {
            mainWindow.webContents.send('pesan', `ERROR! Barang dengan kode ${kode} sudah ada`, pesan.error);
        }
    } else {
        tambahBarang(kode, nama, jumlah, kuantitas, hargaSatuan);
        mainWindow.webContents.send('stock-data', dataBarang);
    }
    let dataBarangRaw = JSON.stringify(dataBarang);
    fs.writeFile(dataBarangJSON, dataBarangRaw, (err) => {
        return;
    });
});

// edit some stuff from warehouse
ipcMain.on('edit-barang', (e, kode, nama, jumlah, kuantitas, hargaSatuan, index) => {
    let jumlahPerbiji;
    kumpulanKodeBarang = [];
    let kondisi;
    if (kuantitas == 'lusin'){
        jumlahPerbiji = jumlah * perbiji.lusin;
    } else if (kuantitas == 'rim') {
        jumlahPerbiji = jumlah * perbiji.rim;
    } else {
        jumlahPerbiji = jumlah;
    }

    for (let key in dataBarang){
        kumpulanKodeBarang.push(dataBarang[key].kode);
    }

    let data = kumpulanKodeBarang.splice(index, 1);
    if (!data.includes(kode)){
        kondisi = true;
    } else {
        kondisi = false;
    }

    if (!kumpulanKodeBarang.includes(kode)){
        dataBarang[index] = {kode, nama, jumlah: jumlahPerbiji, hargaSatuan};
        let dataBarangRaw = JSON.stringify(dataBarang);
        mainWindow.webContents.send('edited', dataBarang[index]);
        fs.writeFile(dataBarangJSON, dataBarangRaw, (err) => err);
        mainWindow.webContents.send('pesan', `Barang dengan kode ${kode} berhasil diedit`, pesan.success);
    } else if (kondisi === true && dataBarang[index].kode == kode && (dataBarang[index].nama != nama || dataBarang[index].jumlah != jumlah || dataBarang[index].hargaSatuan != hargaSatuan)){
        dataBarang[index] = {kode, nama, jumlah: jumlahPerbiji, hargaSatuan};
        let dataBarangRaw = JSON.stringify(dataBarang);
        mainWindow.webContents.send('edited', dataBarang[index]);
        fs.writeFile(dataBarangJSON, dataBarangRaw, (err) => err);
        mainWindow.webContents.send('pesan', `Barang dengan kode ${kode} berhasil diedit`, pesan.success);
    } else {
        mainWindow.webContents.send('pesan', `ERROR! Barang dengan kode ${kode} sudah ada`, pesan.error);
    }
});

// delete some stuff from warehouse
ipcMain.on('delete-barang', function(e, data){
    mainWindow.webContents.send('pesan', `Barang dengan kode ${dataBarang[data].kode} berhasil dihapus`, pesan.success);
    dataBarang.splice(data, 1);
    let dataBarangRaw = JSON.stringify(dataBarang);
    fs.writeFile(dataBarangJSON, dataBarangRaw, (err) => err);
});

const tambahBarang = (kode, nama, jumlah, kuantitas, hargaSatuan) => {
    let jumlahPerbiji;
    if (kuantitas == 'lusin'){
        jumlahPerbiji = jumlah * perbiji.lusin;
    } else if (kuantitas == 'rim') {
        jumlahPerbiji = jumlah * perbiji.rim;
    } else {
        jumlahPerbiji = jumlah;
    }
    
    dataBarang.push({
        kode: kode,
        nama: nama,
        jumlah: jumlahPerbiji,
        hargaSatuan: hargaSatuan
    });
}

//creating custom menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.env.Node_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'DevTools',
        click(item, focusedWindow){
            focusedWindow.toggleDevTools();
        }
    });
}