'use strict';

 // 1) on récupère le panier stocké dans le locage storage
let cart = retrieveCart();

// 2) on trie le panier sur l'id : cela regroupe par id et couleurs 
cart.sort(function compare(a, b) {
    if (a.id < b.id)
           return -1;
    if (a.id > b.id )
           return 1;
        return 0;
});
console.log('cart trié: ', cart);

// 3) on remplit le contenu de la page avec les différents éléments issus du panier 
fillContent(cart);

// 4) on détecte la saisie du formulaire, on vérifie les saisies et si ok on passe la commande via POST API
manageForm();


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

/**
* Remplit le contenu de la page avec les différents éléments contenus dans le panier, et affichage des totaux 
*   - Pour chaque éléments du panier: 
*       - on récupère les infos produits via GET API
*       - on calcule les quantité et le prix totaux 
*       - on ajoute au fragment les éléments HTML en utilisant les infos produits
*       - on crée les gestionnaires d'évènements sur l'input quantité et le "bouton" supprimer 
*   - On insert le fragment dans le DOM
*   - On affiche les totaux (quantité et prix)
* @param { Object } cart - panier
*/
async function fillContent(cart)  {

    // fragment utilisé pour faire une insertion dans le DOM en une fois (/perf)  
    let fragmentItems = document.createDocumentFragment();
    let totalQuantity = 0;
    let totalPrice = 0;

    // on boucle sur les éléments du panier : appel API pour avoir les infos et les afficher
    for (let cartItem of cart) {

        // on récupère les infos en appellant l'API avec l'id du produit
        const product = await retrieveApiByID(cartItem.id);
        
        // on calcule la quantité et le prix
        totalQuantity += cartItem.quantity;
        totalPrice += (cartItem.quantity * product.price);
        
        // ------  on crée tous les éléments HTMLs qu'on ajoute au fragment :

        // création <article>
        let newArticle = document.createElement('article');
        newArticle.classList.add('cart__item');
        newArticle.setAttribute('data-id', cartItem.id);
        newArticle.setAttribute('data-color', cartItem.color);
        fragmentItems.appendChild(newArticle);

        // création 1ere <div> item_img
        let newDiv1 = document.createElement('div');
        newDiv1.classList.add('cart__item__img');
        newArticle.appendChild(newDiv1);

        // création <img> du canapé 
        let newImg = document.createElement('img');
        newImg.setAttribute('src', product.imageUrl);
        newImg.setAttribute('alt',  product.altTxt );
        newDiv1.appendChild(newImg);

        // création <div> item_content
        let newDiv2 = document.createElement('div');
        newDiv2.classList.add('cart__item__content');
        newArticle.appendChild(newDiv2);

        // création <div> description
        let newDiv2S1 = document.createElement('div');
        newDiv2S1.classList.add('cart__item__content__description');
        newDiv2.appendChild(newDiv2S1);

        // création titre <h2> - nom canapé
        let newH2 = document.createElement('h2'); 
        newH2.textContent = product.name;
        newDiv2S1.appendChild(newH2);

        // création <p> couleur
        let newP1 = document.createElement('p'); 
        newP1.textContent = cartItem.color;
        newDiv2S1.appendChild(newP1);

        // création <p> prix
        let newP2 = document.createElement('p'); 
        newP2.textContent = (product.price + ' €');
        newDiv2S1.appendChild(newP2);

        // création <div> settings
        let newDiv2S2 = document.createElement('div');
        newDiv2S2.classList.add('cart__item__content__settings');
        newDiv2.appendChild(newDiv2S2);

         // création <div> quantité
        let newDiv2S2S1 = document.createElement('div');
        newDiv2S2S1.classList.add('cart__item__content__settings__quantity');  
        newDiv2S2.appendChild(newDiv2S2S1);

        // création <p> quantité
        let newP3 = document.createElement('p');
        newP3.textContent= 'Qté : ';
        newDiv2S2S1.appendChild(newP3);
         
        // création <input> quantité
        let newInput = document.createElement('input');
        newInput.classList.add('itemQuantity');
        newInput.setAttribute('type', 'number');
        newInput.setAttribute('name', 'itemQuantity');
        newInput.setAttribute('min', '1');
        newInput.setAttribute('max', '100');
        newInput.setAttribute('value', cartItem.quantity);
        newDiv2S2S1.appendChild(newInput);

        // gestion changement quantité
        newInput.addEventListener('change', function (e) {

            // si la nouvelle quantité saisie est valide, on la change  (mise à jour de la quantité du panier, recalcul et affichage des totaux) 
            if (checkQuantityInput(e.target.value) == true) {
                changeQuantity(cartItem.id, cartItem.color, Number(e.target.value), product.price);

             // si la nouvelle quantité saisie est invalide : on positionne le focus et on remet la quantité d'origine
            } else { 
                newInput.focus();   // si la quantité n'est pas valide, on revient à celle d'origine
                newInput.value = cartItem.quantity; 
            }    
        });

         // création <div> supprimer
        let newDiv2S2S2 = document.createElement('div');
        newDiv2S2S2.classList.add('cart__item__content__settings__delete');  
        newDiv2S2.appendChild(newDiv2S2S2);

         // création <p> supprimer
        let newP4 = document.createElement('p');
        newP4.textContent= 'Supprimer';
        newP4.classList.add('deleteItem');
        newDiv2S2S2.appendChild(newP4);

        // si "bouton" supprimer cliqué, on supprime l'élémént du panier, du DOM et on refait les calculs
        newP4.addEventListener('click', () => {deleteItem(cartItem.id, cartItem.color, product.price);}) ;

        // ------  fin création des éléments HTMLs
    }
    // fin boucle sur les éléments du panier   

    // insertion du fragment global dans le DOM en une fois
    let itemsPosition = document.getElementById('cart__items');
    itemsPosition.appendChild(fragmentItems);
  
    // affichage de la quantité totale et du prix total
    totalQuantityAndPrice();  


    /**
    * Récupère les informations d'un produit donné:  fetch  API (GET) à partir de l'id du produit
    * @param { String } id - id du produit
    * @return { Object } product - produit 
    */
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
   
    /**
    * vérifie les nouvelles quantités saisies:
    *   si KO, on renvoie message d'erreur et on restaure la quantité d'origine
    * @param { String } quantityInput - nouvelle quantité saisie
    * @return {Boolean} DataAreValid - vrai si contrôles OK
    */
     function checkQuantityInput(quantityInput) {
        let DataAreValid = false;
        if ( (/[^0-9]/.test(quantityInput)) || (Number.isInteger(Number(quantityInput)) == false) || (quantityInput == '') ) {
            alert('La quantité doit être un entier entre 1 et 100, \n --> Restauration de la quantité d\'origine du panier');
        } else if (quantityInput == 0) {
            alert('nouvelle quantité saisie = 0: Si vous souhaitez supprimer un article cliquez sur "supprimer" , \n --> Restauration de la quantité d\'origine du panier');
        } else if (quantityInput < 1 || quantityInput > 100) {
            alert('Veuillez saisir une quantité entre 1 et 100, \n --> Restauration de la quantité d\'origine du panier');
        } else {
            DataAreValid = true;
        }  
        return DataAreValid; 
    }

    /**
    * Permet de changer la quantité :
    *   - recherche dans le panier
    *   - mise à jour de la quantité du panier 
        - recalcul et affichage des totaux 
    * @param { String } id - id du produit
    * @param { String } color - couleur séléectionée
    * @param { Number } newQuantity - nouvelle quantité saisie
    * @param { Number } price - prix du produit
    */
    function changeQuantity(id, color, newQuantity, price) {
        console.log('changement quantité pour id: ', id, ', color: ', color, ', newQuantity: ', newQuantity, ' price: ', price);
        let oldQuantity = 0;
        // recherche élément correspondant dans le panier + maj
        let searchedCartItem = cart.find(searchItem => ((searchItem.id == id) && (searchItem.color == color) ));
        if (searchedCartItem == undefined) {
            console.log('cartItem non trouvé pour id = ', id, ' color = ',color);
        }else {
            //si présent on récupère la quantité d'origine et on met à jour la quantité du panier
            oldQuantity = searchedCartItem.quantity;
            searchedCartItem.quantity = newQuantity; 
            // on enregistre le panier
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('cart :', cart);
        }

        // recalcul quantité totale et prix total
        totalQuantity = (totalQuantity + newQuantity - oldQuantity);
        totalPrice =(totalPrice + ((newQuantity - oldQuantity) * price) );
        console.log('totalQuantity: ', totalQuantity, ' totalPrice: ', totalPrice);

        // affichage des quantité totale et prix total
        totalQuantityAndPrice();
    }

    /**
    * Supprime une ligne du panier: 
    *   - recalcul et affichage des totaux
    *   - suppression de la ligne du panier
        - suppression de l'artice correspondant dans le DOM 
    * @param { String } id - id du produit
    * @param { String } color - couleur séléectionée
    * @param { Number } price - prix du produit
    */
    function deleteItem(id, color, price) { 
        //on récupère l'item dans le panier (pour récupérer la quantité) :
        let searchedCartItem = cart.find(searchItem => ((searchItem.id == id) && (searchItem.color == color) ));
        // si trouvé
        if (searchedCartItem !== undefined) {
            
            // on met à jour les totaux :
                totalQuantity -= searchedCartItem.quantity;
                totalPrice -= (searchedCartItem.quantity * price);
                // affichage des quantité totale et prix total
                totalQuantityAndPrice();
            
            // on supprime du panier et on l'enregistre
                cart = cart.filter((item) => ( !(item.id == id && item.color == color) ));
                localStorage.setItem('cart', JSON.stringify(cart));
        }
        // on supprime l'article de la page  
        document
            .querySelector('[data-id="'+ id +'"][data-color="' + color + '"]')
            .remove();
    }

    /**
    * gère l'affichage des quantité et prix total :    
    */
    function totalQuantityAndPrice() {

        // affichage quantité totale
        document
            .getElementById('totalQuantity')
            .textContent = totalQuantity;

        // affichage prix total (avec 2 décimales et aux normes françaises)
        let formatedTotalprice = totalPrice.toLocaleString('fr-FR',{
            minimumFractionDigits: 2,      
            maximumFractionDigits: 2,
        });
        document
            .getElementById('totalPrice')
            .textContent = formatedTotalprice;
    }
}
   
/**
* surveille la soumission du formulaire: si click on va faire les vérifications préalables puis envoyer la commande  
*/
function manageForm () {

    document
        .getElementById('order')
        .addEventListener('click', order) ;

    /**
    * Gère la demande de commande : 
    *   - vérification que le panier n'est pas vide
    *   - vérification de la bonne saisie des champs du formulaires
    *   - si OK: 
    *       - constitution de l'object contact (contenu formulaire) + tableau des Ids du produit à commander
    *       - envoi par POST à l'API
    *       - récupération de l'ID de la commande retourné par l'API pour l'inclure dans l'URL de la page confirmation vers laquelle on redirige   
    */
    function order(e) {

        e.preventDefault();

        // on vérifie qu'il y a bien qqch à commander (panier non vide).
        if (cart.length == 0) {
            alert('Votre panier est vide. Veuillez ajouter des produits avant de passer commande');

        } else { 
            // si le formulaire est correctement saisi, on prépare et poste la commande
            if (checkForm() == true) {
                // préparation 1ere partie : objet contact
                let contact = { firstName: document.getElementById('firstName').value,
                                lastName: document.getElementById('lastName').value,
                                address: document.getElementById('address').value,
                                city: document.getElementById('city').value,
                                email: document.getElementById('email').value 
                            };
                //console.log('Contact: ', contact);
                // préparation 2eme partie : tableau des Id produits (n.b. : V1 de l'API ne gère que les IDs, pas les couleurs ni les quantités)
                let products = [];
                for (let cartItem of cart) {
                    products.push(cartItem.id);
                }
                // concaténation des 2 parties pour créer le "body"
                let contactAndProducts = {contact,products};
                //console.log('products ', products);
                console.log('contactAndProducts ', contactAndProducts);

                // on envoie la commande à l'API et on redirige vers la page confirmation
                postOrder(contactAndProducts);
            }
        }

        /**
         * Vérifie les inputs du formulaire:
         *  - chaque champs est vérifié selon une RegExp.
         *  - Si KO : 
         *      -  on ajoute un message d'erreur spécifique sous les champs concernés
         *      -  le focus est mis sur le 1er champs en erreur
         * 
         * @return {Boolean} DataAreValid - vrai si les champs du formulaire sont correctement renseignés
         */
        function checkForm() {
            // les différentes Regexp de contrôles et messages d'erreurs associés 
            const emailTypeRegexp = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i'); 
            const emailTypeRegexpMsg ='Veuillez saisir une adresse email valide, du type "max01.exemple@monhebergeur.com"'; 
            const charTypeRegexp =new RegExp('^[a-zàâéèëêïîôùüçœ][a-zàâéèëêïîôùüçœ\'’ -]{0,58}[a-zàâéèëêïîôùüçœ]$','i');
            const charTypeRegexpMsg = ' Champs mal renseigné. Caractères acceptés (60 max) : a-z,à â é è ë ê ï î ô ù ü ç œ \'  -';
            const charAndDigitTypeRegexpMax = new RegExp('^[a-zàâéèëêïîôùüçœ0-9][a-zàâéèëêïîôùüçœ0-9\'’ -]{0,78}[a-zàâéèëêïîôùüçœ0-9]$','i');
            const charAndDigitTypeRegexpMaxMsg = ' Champs mal renseigné. Caractères acceptés (80 max) : a-z,à â é è ë ê ï î ô ù ü ç œ \'  -  0-9';
            const charAndDigitTypeRegexpMin = new RegExp('^[a-zàâéèëêïîôùüçœ0-9][a-zàâéèëêïîôùüçœ0-9\'’ -]{0,58}[a-zàâéèëêïîôùüçœ0-9]$','i');
            const charAndDigitTypeRegexpMinMsg = ' Champs mal renseigné. Caractères acceptés (60 max) : a-z,à â é è ë ê ï î ô ù ü ç œ \'  -  0-9';

            // tableau des associations champs input / regexp de contrôle / message en cas d'erreur 
            let fieldsRules =  [{id:'firstName', regExp: charTypeRegexp, errorMsg: charTypeRegexpMsg},
                                {id:'lastName', regExp: charTypeRegexp, errorMsg: charTypeRegexpMsg},
                                {id:'address', regExp: charAndDigitTypeRegexpMax, errorMsg: charAndDigitTypeRegexpMaxMsg},
                                {id:'city', regExp: charAndDigitTypeRegexpMin, errorMsg: charAndDigitTypeRegexpMinMsg},
                                {id:'email', regExp: emailTypeRegexp, errorMsg: emailTypeRegexpMsg}
                                ];
            let previousFocus = false;
            let dataAreValid = true;
            
            // boucle sur les différents champs à vérifier                   
            for (let field of fieldsRules) {
                // on récupère le contenu du champs à controler et on teste la regexp associée.  
                let fieldToCheck = document.getElementById(field.id);   
                if ((field.regExp).test(fieldToCheck.value) == true) {
                    // si OK on efface l'eventuel message d'erreur précédent
                    document
                        .getElementById(field.id+'ErrorMsg')
                        .textContent = '';
                } else {
                    dataAreValid = false;
                    // si KO on affiche le message d'erreur sous le champs concerné
                    document
                        .getElementById(field.id+'ErrorMsg')
                        .textContent = field.errorMsg;
                    // on met le focus sur le 1er champs en erreur.
                    if (previousFocus == false) {
                        fieldToCheck.focus();
                        previousFocus = true;
                    }
                }
            }
            return dataAreValid;
        }
        /**
         * Envoie la commande par POST sur l'API. 
         *  Si ok, on redirige vers la page de confirmation (en intégrant l'Id de commande ans l'url). 
         * @param { Object } contactAndProducts - données envoyées à l'API : objet contact + tableau des ids produits
         */
        async function postOrder(contactAndProducts) {

            try {
                const response = await fetch('http://localhost:3000/api/products/order', {
                    method : 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                        },
                    body : JSON.stringify(contactAndProducts) 
                }); 

                const orderResponse = await response.json();
                console.log('(commande passée : orderResponse.orderId : ', orderResponse.orderId);
                // redirection vers la page confirmation en intégrant le n° de commande dans l'URL
                window.location.href=('./confirmation.html?id='+ orderResponse.orderId);

            }
            catch (error) {
                console.log('erreur fetch api post : ', error);
                alert('echec de la prise en compte de la commande');
            }
        }
    }
}




