'use strict';

const productId = retrieveID();
//console.log(' id :', productId );

function retrieveID() {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('id')) {
        const id = searchParams.get('id');
        return id;
    }
}

fillProduct();

async function fillProduct() {
    let newImg = document.createElement('img');
    const product = await retrieveApiByID(productId);

    // création image du canapé 
    newImg.setAttribute('src', product.imageUrl);
    newImg.setAttribute('alt', product.altTxt);
    document
        .querySelector('.item__img')
        .appendChild(newImg);

    // titre
    document
        .getElementById('title')
        .textContent = product.name;

    // description
    document
        .getElementById('description')
        .textContent = product.description;

    // prix // icijco à mettre avec virgule ?
    document
        .getElementById('price')
        .textContent = product.price;

    // couleur (on constitue un fragment pour insertion en 1 fois dans le DOM)
    let fragmentColors = document.createDocumentFragment();
    for (let color of product.colors) {
        let newOption = document.createElement('option');
        newOption.textContent = color;
        newOption.setAttribute('value', color);
        fragmentColors.appendChild(newOption);
    }
    document
        .getElementById('colors')
        .appendChild(fragmentColors);
}

async function retrieveApiByID(Id) {
    try {
        const response = await fetch('http://localhost:3000/api/products/' + Id);
        const product = await response.json();
        console.log(product);
        return product;
    }
    catch (error) {
        console.log('erreur fetch api get /id : ', error);
    }
}


let DataAreValid = false;
document
    .getElementById('addToCart')
    .addEventListener('click', toCart) ;

function toCart() {
    console.log('entrée dans toCart ');
//    await fillProduct();
    let colorInput = document.getElementById('colors');
    let quantityInput = document.getElementById('quantity');
    checkColorInput(colorInput.value);
    if (DataAreValid) {
        checkQuantityInput(quantityInput.value);
    }
    if (DataAreValid) {
//        createCartItem(productId, colorInput.value, Number(quantityInput.value) );
        let cartItem = new Cartitem(productId, colorInput.value, Number(quantityInput.value));
        addCart(cartItem);
    }
}

function checkColorInput(colorInput) {
    if (colorInput == '' ) {
        DataAreValid = false;
        alert('Veuillez sélectionner une couleur');
    } else {
        DataAreValid = true;
        console.log('couleur valide!');
        }        
}
function checkQuantityInput(quantityInput) {
    if ( (/[^0-9]/.test(quantityInput)) || (Number.isInteger(Number(quantityInput)) == false) || (quantityInput == '') ) {
        DataAreValid = false;
        alert('La quantité doit être un entier entre 1 et 100');
    } else if (quantityInput == 0) {
        DataAreValid = false;
        alert('Veuillez choisir une quantité');
    } else if (quantityInput < 1 || quantityInput > 100) {
        DataAreValid = false;
        alert('Veuillez saisir une quantité entre 1 et 100');
    } else {
        DataAreValid = true;
        console.log('quantité valide!');
    }   
}

function addCart(cartItem) {
    // on récupère le panier s'il existe, sinon on récupère un tableau vide
    let cart = retrieveCart();

    // on test si l'élément est déja présent (id + couleur) dans le panier
    let searchedCartItem = cart.find(searchItem => ((searchItem.id == cartItem.id) && (searchItem.color == cartItem.color) ));
    if (searchedCartItem == undefined) {
        //si pas déja présent on l'ajoute
        cart.push(cartItem);
    }else {
        //si présent on met à jour la quantité
        searchedCartItem.quantity += cartItem.quantity; 
    }
    // on enregistre le panier
    localStorage.setItem('cart', JSON.stringify(cart));
}

function retrieveCart() {
    let retrievedCart= JSON.parse(localStorage.getItem('cart'));
    if (retrievedCart == null) {
        return [];
    } else {
        return retrievedCart;
    }
}

class Cartitem {
     constructor(id,color,quantity) {
        this.id = id;
        this.color = color;
        this.quantity = quantity;
     }
}

//function createCartItem(productId, color, quantity) {
//    console.log('reste à créer panier');
    // code en dur pour tester
//    let cartItem = new Cartitem(productId, color, quantity);
//    console.log('cartItem : ', cartItem);
//    localStorage.setItem('cartitem', JSON.stringify(cartItem));
//    let retrievedCartItem = JSON.parse(localStorage.getItem('cartitem'));
//    console.log('retrievedCartItem : ', retrievedCartItem);
//    addCart(cartItem);
    
//    cart.addCart((cartItem));     
//}


/* POO ?
let cart = {
    let incart = [],

    addCart(cartItem) {
        this.cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
 
};
*/ 

/*test objet vs class
class Cart {
    constructor() {
        this.cart = [];
    }
    addCart(cartItem) {
        this.cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    getCart() {
        let cart = JSON.parse(localStorage.getItem('cartitem'));
    }

}
let cart = new Cart;
*/ 



