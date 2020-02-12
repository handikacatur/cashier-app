const electron = require('electron');

const {ipcRenderer} = electron;

const tambah = document.querySelector('#tambah-barang');
const edit = document.querySelector('#edit-barang');
const stockTable = document.querySelector('#stock-table').getElementsByTagName('tbody')[0];
const pagination = document.querySelector('.pagination');
let errorMessage, color, dataBarangGlobal, index, deleteDecrement = 10;

const sidenav = document.querySelector('.sidenav');
M.Sidenav.init(sidenav);

const dropdown = document.querySelectorAll('.dropdown-trigger');
M.Dropdown.init(dropdown);

const modal = document.querySelectorAll('.modal');
M.Modal.init(modal);

const selects = document.querySelectorAll('select');
M.FormSelect.init(selects);

const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2
});

function PageChange(data){
    const page = document.querySelectorAll('#main-card');
    const menu = document.getElementById('slide-out').children;
    for (let i = 0; i < page.length; i++){
        if (i == data){
            !menu[i].classList.contains('active') ? menu[i].classList += 'active disabled' : false;
        } else {
            menu[i].classList.remove('active', 'disabled');
        }
    }
    for (let i = 0; i < page.length; i++){
        if (i == data){
            page[i].classList.remove('hidden');
        } else {
            !page[i].classList.contains('hidden') ? page[i].classList += ' hidden' : false;
        }
    }
}

function EditBarang(data){
    const labels = document.querySelectorAll('#edit-modal .modal-content .row form .input-field label');
    const editKode = document.querySelector('#edit-modal .modal-content .row form #edit-kode');
    const editNama = document.querySelector('#edit-modal .modal-content .row form #edit-nama');
    const editjumlah = document.querySelector('#edit-modal .modal-content .row form #edit-jumlah');
    const editHarga = document.querySelector('#edit-modal .modal-content .row form #edit-harga');
    for (let i = 0; i < labels.length; i++){
        if (labels[i].classList.value === ""){
            labels[i].classList.toggle('active');
        }
    }
    editKode.value = dataBarangGlobal[data].kode;
    editNama.value = dataBarangGlobal[data].nama;
    editjumlah.value = dataBarangGlobal[data].jumlah;
    editHarga.value = dataBarangGlobal[data].hargaSatuan;
    index = data;
}

function DeleteBarang(data){
    stockTable.innerHTML = ``;
    ipcRenderer.send('delete-barang', data);
    dataBarangGlobal.splice(data, 1);
    CreatePagination(pagination);
    PaginationChange(deleteDecrement/10 + 1);
}

function Delete(data){
    index = data;
}

function confirmDelete(){
    DeleteBarang(index);
}

function ChangeTable(i){
    let index;
    if (i == pagination.children.length - 1){
        index = (i * 10) - 10;
    } else if (i == 0){
        index = 0
    } else {
        index = i * 10;
    }
    deleteDecrement = index - 10;
    let akhir = dataBarangGlobal.length;
    stockTable.innerHTML = ``;
    function CreateTable(index, pengurang){
        for (let j = index - pengurang; j < index; j++){
            stockTable.innerHTML += /*html*/ `
            <tr>
                <td>${j + 1}</td>
                <td>${dataBarangGlobal[j].kode}</td>
                <td>${dataBarangGlobal[j].nama}</td>
                <td>${dataBarangGlobal[j].jumlah + ' biji'}</td>
                <td>${formatter.format(dataBarangGlobal[j].hargaSatuan)}</td>
                <td>
                    <a href="#edit-modal" class="action-buttons-edit modal-trigger" onclick="EditBarang(this.parentNode.parentNode.children[0].innerText - 1)">
                        <i class="fa fa-pen-square" style="margin: 2px"></i>
                    </a>
                    <a id="delete" href="#delete-modal" class="action-buttons-trash modal-trigger" onclick="Delete(this.parentNode.parentNode.children[0].innerText - 1)">
                        <i class="fa fa-trash" style="margin: 2px"></i>
                    </a>
                </td>
            </tr>
            `;
        }
    }
    if (i == 0){
        akhir%10 == 0 ? CreateTable(index + 10, 10) : CreateTable(akhir, akhir - (akhir - akhir%10));
    } else if (i == pagination.children.length - 2 || i == pagination.children.length - 1){
        akhir%10 == 0 ? CreateTable(index, 10) : CreateTable(akhir, akhir - (akhir - akhir%10));
    } else {
        CreateTable(index, 10);
    }
    
}

function PaginationChange(i){
    ChangeTable(i);
    if(i == 0){
        for (let j = 0; j < pagination.children.length; j++){
            if (j == 0){
                !pagination.children[j].classList.contains('disabled') ? pagination.children[j].classList += ' disabled' : false;
            } else if (j == 1){
                !pagination.children[j].classList.contains('active') ? pagination.children[j].classList += ' active' : false;
            } else if (j == pagination.children.length - 1){
                pagination.children[j].classList.remove('disabled');
            } else {
                pagination.children[j].classList.remove('active');
            }
        }
    } else if (i == 1){
        for (let j = 0; j < pagination.children.length; j++){
            if (j == 0){
                !pagination.children[j].classList.contains('disabled') ? pagination.children[j].classList += ' disabled' : false;
            } else if (j == i){
                !pagination.children[j].classList.contains('active') ? pagination.children[j].classList += ' active' : false;
            } else if (j == pagination.children.length - 1){
                !pagination.children[j].classList.contains('disabled') ? false : pagination.children[j].classList.remove('disabled');
            } else {
                pagination.children[j].classList.remove('active');
            }
        }
    } else if (i == pagination.children.length - 2){
        for (let j = 0; j < pagination.children.length; j++){
            if (j == 0){
                pagination.children[j].classList.remove('disabled');
            } else if (j == i){
                !pagination.children[j].classList.contains('active') ? pagination.children[j].classList += ' active' : false;
            } else if (j == pagination.children.length - 1){
                !pagination.children[j].classList.contains('disabled') ? pagination.children[j].classList += ' disabled' : false;
            } else {
                pagination.children[j].classList.remove('active');
            }
        }
    } else if (i == pagination.children.length - 1){
        for (let j = 0; j < pagination.children.length; j++){
            if (j == 0){
                pagination.children[j].classList.remove('disabled');
            } else if (j == pagination.children.length - 2){
                !pagination.children[j].classList.contains('active') ? pagination.children[j].classList += ' active' : false;
            } else if (j == pagination.children.length - 1){
                !pagination.children[j].classList.contains('disabled') ? pagination.children[j].classList += ' disabled' : false;
            } else {
                pagination.children[j].classList.remove('active');
            }
        }
    } else {
        for (let j = 0; j < pagination.children.length; j++){
            if (j == 0 || j == pagination.children.length - 1){
                pagination.children[j].classList.remove('disabled');
            } else if (j == i){
                !pagination.children[j].classList.contains('active') ? pagination.children[j].classList += ' active' : false;
            } else {
                pagination.children[j].classList.remove('active');
            }
        }
    }
}

function CreatePagination(pagination){
    pagination.innerHTML = ``
    let templateList = ``
    function CreateList(i){
        if (i === 0){
            templateList += /*html*/ `<li class="waves-effect active"><a href="#!" onclick="PaginationChange(this.innerText)">${i+1}</a></li>`;
        } else {
            templateList += /*html*/ `<li class="waves-effect"><a href="#!" onclick="PaginationChange(this.innerText)">${i+1}</a></li>`
        }
    }
    if (dataBarangGlobal.length > 10){
        if (dataBarangGlobal.length%10 === 0){
            for (let i = 0; i < dataBarangGlobal.length/10; i++){
                CreateList(i);
            }
        } else {
            for (let i = 0; i < (dataBarangGlobal.length - dataBarangGlobal.length%10)/10 + 1; i++){
                CreateList(i);
            }
        }
    } else {
        templateList += `<li class="waves-effect active"><a href="#!">1</a></li>`
    }
    
    pagination.innerHTML += `
    <li class="waves-effect disabled"><a href="#!" onclick="PaginationChange(0)"><i class="fa fa-angle-double-left"></i></a></li>
    ${templateList}
    <li class="waves-effect"><a href="#!" onclick="PaginationChange(this.parentNode.parentNode.children.length - 1)"><i class="fa fa-angle-double-right"></i></a></li>
    `
}

if (stockTable.getElementsByTagName('tr').length === 0){
    ipcRenderer.on('warehouse-data', (e, dataBarang) => {
        dataBarangGlobal = dataBarang;
        if (dataBarangGlobal.length%10 == 0 || dataBarangGlobal.length > 10){
            for(let i = 0; i < 10; i++){
                stockTable.innerHTML += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${dataBarang[i].kode}</td>
                    <td>${dataBarang[i].nama}</td>
                    <td>${dataBarang[i].jumlah + ' biji'}</td>
                    <td>${formatter.format(dataBarang[i].hargaSatuan)}</td>
                    <td>
                        <a href="#edit-modal" class="action-buttons-edit modal-trigger" onclick="EditBarang(this.parentNode.parentNode.children[0].innerText - 1)">
                            <i class="fa fa-pen-square" style="margin: 2px"></i>
                        </a>
                        <a id="delete" href="#delete-modal" class="action-buttons-trash modal-trigger" onclick="Delete(this.parentNode.parentNode.children[0].innerText - 1)">
                            <i class="fa fa-trash" style="margin: 2px"></i>
                        </a>
                    </td>
                </tr>
                `;
            }
            CreatePagination(pagination);
        } else {
            for(let i = 0; i < dataBarangGlobal.length; i++){
                stockTable.innerHTML += /* html */ `
                <tr>
                    <td>${i + 1}</td>
                    <td>${dataBarang[i].kode}</td>
                    <td>${dataBarang[i].nama}</td>
                    <td>${dataBarang[i].jumlah + ' biji'}</td>
                    <td>${formatter.format(dataBarang[i].hargaSatuan)}</td>
                    <td>
                        <a href="#edit-modal" class="action-buttons-edit modal-trigger" onclick="EditBarang(this.parentNode.parentNode.children[0].innerText - 1)">
                            <i class="fa fa-pen-square" style="margin: 2px"></i>
                        </a>
                        <a id="delete" href="#delete-modal" class="action-buttons-trash modal-trigger" onclick="Delete(this.parentNode.parentNode.children[0].innerText - 1)">
                            <i class="fa fa-trash" style="margin: 2px"></i>
                        </a>
                    </td>
                </tr>
                `;
            }
            CreatePagination(pagination);
        }
    });
}


// listen to message from main.js
ipcRenderer.on('pesan', (e, err, message) => {
    errorMessage = err;
    color = message;
    if (color === 'green') {
        tambah.reset();
        for (let i = 0; i < modal.length; i++){
            M.Modal.getInstance(modal[i]).close();
        }
    }
    M.toast({html: `${errorMessage}`, classes: `${color}`});
});

// tambah barang
tambah.addEventListener('submit', submitBarang);

// edit barang
edit.addEventListener('submit', SelesaiEdit);

// selesai edit barang
ipcRenderer.on('edited', (e, data) => {
    dataBarangGlobal[index] = data;
    let dataEdited = []
    let TRow = stockTable.children[index].children;
    dataEdited.push(data.kode, data.nama, data.jumlah, data.hargaSatuan);
    for (let i = 1; i < TRow.length - 1; i++){
        let j = i - 1;
        if (j === 3){
            TRow[i].innerHTML = formatter.format(dataEdited[j]);
        } else if (j === 2){
            TRow[i].innerHTML = `${dataEdited[j]} biji`
        } else {
            TRow[i].innerHTML = dataEdited[j];
        }
    }
});

// listen to data change
ipcRenderer.on('stock-data', (e, dataBarang) => {
    dataBarangGlobal = dataBarang;
    let i = dataBarang.length - 1;
    if (dataBarang.length == 0){
        stockTable += /* html */ `
        <tr>
            <td>i + 1</td>
            <td>${dataBarang[i].kode}</td>
                <td>${dataBarang[i].nama}</td>
                <td>${dataBarang[i].jumlah + ' biji'}</td>
                <td>${formatter.format(dataBarang[i].hargaSatuan)}</td>
                <td>
                    <a href="#edit-modal" class="action-buttons-edit modal-trigger" onclick="EditBarang(this.parentNode.parentNode.children[0].innerText - 1)">
                        <i class="fa fa-pen-square" style="margin: 2px"></i>
                    </a>
                    <a id="delete" href="#delete-modal" class="action-buttons-trash modal-trigger" onclick="Delete(this.parentNode.parentNode.children[0].innerText - 1)">
                        <i class="fa fa-trash" style="margin: 2px"></i>
                    </a>
                </td>
            </tr>
        </tr>
        `;
    } else {
        if (stockTable.children[stockTable.children.length - 1].children[0].innerText == dataBarang.length - 1 && stockTable.children.length%10 != 0){
            stockTable.innerHTML += /* html */ `
            <tr>
                <td>${i + 1}</td>
                <td>${dataBarang[i].kode}</td>
                    <td>${dataBarang[i].nama}</td>
                    <td>${dataBarang[i].jumlah + ' biji'}</td>
                    <td>${formatter.format(dataBarang[i].hargaSatuan)}</td>
                    <td>
                        <a href="#edit-modal" class="action-buttons-edit modal-trigger" onclick="EditBarang(this.parentNode.parentNode.children[0].innerText - 1)">
                            <i class="fa fa-pen-square" style="margin: 2px"></i>
                        </a>
                        <a id="delete" href="#delete-modal" class="action-buttons-trash modal-trigger" onclick="Delete(this.parentNode.parentNode.children[0].innerText - 1)">
                            <i class="fa fa-trash" style="margin: 2px"></i>
                        </a>
                    </td>
                </tr>
            </tr>
            `;
        }
    }
    CreatePagination(pagination);
});

function submitBarang(e){
    e.preventDefault();
    let kode = document.querySelector('#kode-barang').value.toUpperCase();
    let nama = document.querySelector('#nama-barang').value;
    let jumlah = document.querySelector('#jumlah').value;
    let kuantitas = document.querySelector('#kuantitas').value;
    let hargaSatuan = document.querySelector('#harga-satuan').value;
    ipcRenderer.send('tambah-barang', kode, nama, jumlah, kuantitas, hargaSatuan);
}

function SelesaiEdit(e){
    e.preventDefault();
    let kode = document.querySelector('#edit-kode').value.toUpperCase();
    let nama = document.querySelector('#edit-nama').value;
    let jumlah = document.querySelector('#edit-jumlah').value;
    let kuantitas = document.querySelector('#edit-kuantitas').value;
    let hargaSatuan = document.querySelector('#edit-harga').value;
    ipcRenderer.send('edit-barang', kode, nama, jumlah, kuantitas, hargaSatuan, index);
}
