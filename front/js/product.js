'use strict';

// 1) récupération id produit
const productId = retrieveID();

// 2) remplissage du contenu de la page avec les informations produits récupérées via l'API 
fillProduct();

// 3) gestion de l'ajout au panier
document
    .getElementById('addToCart')
    .addEventListener('click', toCart) ;


/**
* Récupère un ID transmis dans l'URL
* @return { String } (id) - id produit récupéré dans l'URL (s'il existe)
*/
function retrieveID() {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('id')) {
        const id = searchParams.get('id');
        return id;
    }
}

/**
* Récupère les informations du produit via l'API et les ajoute au contenu de la page
*/  
async function fillProduct() {

    // Récupèration des infos du produit sur l'API à partir de l'ID produit
    const product = await retrieveApiByID(productId);

    // ----- création et ajout des différents éléments HTML
    // création image du canapé
    let newImg = document.createElement('img'); 
    newImg.setAttribute('src', product.imageUrl);
    newImg.setAttribute('alt', product.altTxt);
    document
        .querySelector('.item__img')
        .appendChild(newImg);

    // ajout du nom dans le titre
    document
        .getElementById('title')
        .textContent = product.name;

    // ajout de la description
    document
        .getElementById('description')
        .textContent = product.description;

    // ajout du prix 
    document
        .getElementById('price')
        .textContent = product.price;

    // création des <option> couleur (on constitue un fragment pour insertion en 1 fois dans le DOM)
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

    //----- fin ajout éléments HTML
}

/**
* Récupère les informations d'un produit donné via GET API (à partir de l'id du produit):
* @param { String } id - id du produit
* @return { Object } product - produit 
*/
async function retrieveApiByID(Id) {
    try {
        const response = await fetch('http://localhost:3000/api/products/' + Id);
        // si l'API n'a pas traité la demande, on génère une erreur 
        if (!response.ok) {
            throw new Error('status code retourné par l\'api non compris entre 200 et 299');
        }
        const product = await response.json();
        console.log('produit récupéré / API : ', product);
        return product;
    }
    catch (error) {
        console.log('erreur fetch api get /id : ', error);
        alert('Erreur technique: echec de la récupération des informations produits');
    }
}


/**
    * Gère la demande d'ajout au panier : 
    *   - vérification de la bonne saisie de la couleur 
    *   - vérification de la bonne saisie de la quantité
    *   - si OK: 
    *       - création d'un nouvel élément
    *       - ajout de l'élément au panier (ou maj quantité si déjà présent dans le panier)
    */
function toCart() {
    let colorInput = document.getElementById('colors');
    let quantityInput = document.getElementById('quantity');

    // si couleur ok, on vérifie la quantité
    if (checkColorInput(colorInput.value) == true) {

        // si quantité ok, on crée un nouvel élément qu'on rajoute au panier
        if (checkQuantityInput(quantityInput.value) == true) {

            let cartItem = new Cartitem(productId, colorInput.value, Number(quantityInput.value));
            addCart(cartItem);
   
        } else {
            quantityInput.focus();
        }

    } else {
        document
            .getElementById('colors')
            .focus();
    }

    /**
    * Vérifie la couleur choisie : doit être renseignée
    * @param { String } colorInput - couleur choisie
    * @return { Boolean } DataAreValid - renvoie true si couleur correctement renseignée
    */
    function checkColorInput(colorInput) {
        let DataAreValid = false;
        if (colorInput == '' ) {
            alert('Veuillez sélectionner une couleur');
        } else {
            DataAreValid = true;
            //console.log('couleur valide!');
        }
        return DataAreValid;         
    }
    /**
    * Vérifie la quantité saisie : doit être un entier compris entre 1 et 100
    * @param { String } quantityInput - quantité saisie
    * @return { Boolean } DataAreValid - renvoie true si quantité correctement renseignée
    */
    function checkQuantityInput(quantityInput) {
        let DataAreValid = false; 
        // vérification du format 
        if ( (/[^0-9]/.test(quantityInput)) || (Number.isInteger(Number(quantityInput)) == false) || (quantityInput == '') ) {
            alert('La quantité doit être un entier entre 1 et 100');
        } else if (quantityInput == 0) {
            alert('Veuillez choisir une quantité > 0');
        } else if (quantityInput < 1 || quantityInput > 100) {
            alert('Veuillez saisir une quantité entre 1 et 100');
        } else {
            DataAreValid = true;
            //console.log('quantité valide!');
        }
        return DataAreValid;   
    }

    /**
    * Ajoute un élement au panier :
    *   - on récupère le panier (stocké dans le local storage) et on vérifie si l'élément y est déjà :
            - si absent : on l'ajoute au panier
            - si présent : on met à jour la quantité
    *   - On enregistre le panier modifié dans le local storage
    * @param { Object } cartitem - un élément du panier
    */
    function addCart(cartItem) {
        // on récupère le panier s'il existe, sinon on récupère un tableau vide
        let cart = retrieveCart();

        // on teste si l'élément (id + couleur) est déja présent dans le panier
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
        console.log('nouvel élément ajouté => cart :', cart);
        //alert('le produit a été ajouté au panier');

        /**
        * Récupère le panier stocké dans le locage storage 
        * @return { Array } (retrievedCart) - panier stocké dans le locage storage. Si absent du localstorage, renvoie un tableau vide
        */
        function retrieveCart() {
            let retrievedCart= JSON.parse(localStorage.getItem('cart'));
            if (retrievedCart == null) {
                return [];
            } else {
                return retrievedCart;
            }
        }
    }
}

class Cartitem {
     constructor(id,color,quantity) {
        this.id = id;
        this.color = color;
        this.quantity = quantity;
     }
}
