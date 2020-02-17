// initialize materialize components
const dropdown = document.querySelectorAll('.dropdown-trigger');
M.Dropdown.init(dropdown);
// end of initializing materialize

const {ipcRenderer} = require('electron');

const searchField = document.getElementById('search-field');
const searchResult = document.getElementById('search-result');
let dataBarangGlobal;

// catch warehouse data
ipcRenderer.on('warehouse-data', (e, dataBarang) => dataBarangGlobal = dataBarang);

class Search {
    constructor(){
        this.template = ``;
        this.matches = [];
    }

    CreateCollection(){
        searchResult.innerHTML = /* html */ `
        <div class="search-result collection with-header">
            <div class="collection-item row">
                <div class="col s6"><span style="font-weight: 600;">KODE</span></div>
                <div class="col s6"><span style="font-weight: 600;">NAMA</span></div>
            </div>
            ${this.template}
        </div>
        `;
    }

    Matching(e){
        let searchText = e.toString()
        this.matches = dataBarangGlobal.filter(state => {
            const regex = new RegExp(`${searchText}`, 'gi');
            return state.kode.match(regex) || state.nama.match(regex);
        });
        if (this.matches.length > 0 && searchText.length != 0){
            this.template = this.matches.map(e => /* html */ `
             <a href="#!" class="collection-item row">
                <div class="col s6">${e.kode}</div>
                <div class="col s6">${e.nama}</div>
             </a>
            `).join('');
            this.CreateCollection();
        } else {
            this.template = ``;
            searchResult.innerHTML = ``;
        }
    }

    EraseCollection(){
        this.template = '';
        searchResult.innerHTML = '';
    }
}

const S = new Search;

searchField.addEventListener('input', e => S.Matching(e.target.value));
searchField.addEventListener('focusout', e => S.EraseCollection());
searchField.addEventListener('submit', e => e.preventDefault());
