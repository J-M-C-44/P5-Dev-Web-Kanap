'use strict';

// récupération de l'ensemble des produits via API et affichage de ceux-ci
retrieveDataApiAndFill();


/**
 * récupère le contenu du catalogue de canapé via fetch API
 * puis crée et insert la structure HTML pour chaque produit du catalogue (via fonction FillContentPage)
 */
function retrieveDataApiAndFill() {

    fetch('http://localhost:3000/api/products')
    .then (response => response.json())
    .then (arrayProducts => fillContentPage(arrayProducts))
    .catch (error => console.log ('erreur fetch api get : ', error));
}

/**
 * Pour chaque produit du catalogue, crée et insert la structure HTML suivante
 *    <a> 
 *      <article>
 *         <img>
 *          <h3>
 *          <p>
 *  @param { Array } arrayProducts - le tableau du catalogue des produits à balayer
 */
function fillContentPage(arrayProducts)  {

    // création du fragment sur lequel on va raccrocher les éléments HTML à insérer (une seule modification du DOM = mieux pour les performances)
    let fragmentItems = document.createDocumentFragment();

    // on boucle sur le catalogue des produits retournés par l'API : création des éléments html + rattachement au fragment   
    for (let product of arrayProducts) {     
        // création lien  vers la fiche du canapé      
        let newA = document.createElement('a');
        newA.setAttribute('href', ('product.html?id='+ product._id));
    
        // création article
        let newArticle = document.createElement('article');
        newA.appendChild(newArticle);
    
        // création image du canapé 
        let newImg = document.createElement('img');
        newImg.setAttribute('src', product.imageUrl);
        newImg.setAttribute('alt',  product.altTxt );
        newArticle.appendChild(newImg);
    
        // création titre h3 - nom canapé
        let newH3 = document.createElement('h3'); 
        newH3.setAttribute('class', 'productName');
        newH3.textContent = product.name;
        newArticle.appendChild(newH3);
                    
        // création paragraphe description du canapé
        let newP = document.createElement('p'); 
        newP.setAttribute('class', 'productDescription');
        newP.textContent = product.description;
        newArticle.appendChild(newP);

        //ajout au fragment 
        fragmentItems.appendChild(newA);

    }// fin boucle

    // insertion du fragment dans le DOM en une fois
    let itemsPosition = document.getElementById('items');
    itemsPosition.appendChild(fragmentItems);
}
