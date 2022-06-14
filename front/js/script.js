'use strict';


retrieveDataApi();

/**
 * récupère le contenu du catalogue de canapé via fetch API
 * puis crée et insert la structure HTML pour chaque produit du catalogue (via fonction FillContent)
 */
function retrieveDataApi() {

    fetch('http://localhost:3000/api/products')
    .then (response => response.json())
    .then (arrayProducts => fillContent(arrayProducts))
    .catch (error => console.log ('erreur fetch api get : ', error));
}

/**
 * Pour chaque produit du catalogue, crée et insert la structure HTML suivante
 *    <a> 
 *      <article>
 *          <img>
 *          <h3>
 *          <p>
 *  @param { Array } arrayProducts - le tableau du catalogue des produits à balayer
 */
function fillContent(arrayProducts)  {
    
    let fragmentItems = document.createDocumentFragment();
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

        //ajout au fragment global
        fragmentItems.appendChild(newA);
        }
    // insertion du fragment global dans le DOM en une fois
    let itemsPosition = document.getElementById('items');
    itemsPosition.appendChild(fragmentItems);
}


// async function retrieveDataApi() {
//     fetch('http://localhost:3000/api/products')
//     .then (response => response.json())
//     .then (arrayProducts => {
// //           console.log('réponse : ', arrayProducts);
//             let itemsPosition = document.getElementById('items');
//             let fragment = document.createDocumentFragment();
//             for (let product of arrayProducts) {     
// //                console.log('produit : ', product);

//                 // voir comment améliorer perf ? qu'est-ce qui est mieux appenchild(newa) puis les autres ou appenchild sur newA puis appenchild A?  
//                 // DocumentFragments ? --> a priori oui,  mais faire un seul fragment ou en faire 1 par item ? dépend du nombre à afficher ? (affichage progressif ?)

// //                let fragment = document.createDocumentFragment();

//                 // lien  vers la fiche du canapé      
//                 let newA = document.createElement('a');
//                 newA.setAttribute('href', ('product.html?id='+ product._id));
//                 newA.setAttribute('alt',  product.altTxt );
// //                itemsPosition.appendChild(newA);
// //                fragment.appendChild(newA);

//                 // article
//                 let newArticle = document.createElement('article');
//                 newA.appendChild(newArticle);

//                 // image du canapé
//                 let newImg = document.createElement('img');
//                 newImg.setAttribute('src', product.imageUrl);
//                 newArticle.appendChild(newImg);

//                 // titre h3 - nom canapé
//                 let newH3 = document.createElement('h3'); 
//                 newH3.setAttribute('class', 'productName');
//                 newH3.textContent = product.name;
//                 newArticle.appendChild(newH3);
                
//                 // paragraphe description du canapé
//                 let newP = document.createElement('p'); 
//                 newP.setAttribute('class', 'productDescription');
//                 newP.textContent = product.description;
//                 newArticle.appendChild(newP);

// //                itemsPosition.appendChild(newA);
// //                itemsPosition.appendChild(fragment);
//                 fragment.appendChild(newA);
//             }

//             itemsPosition.appendChild(fragment);
//         }
//     )
//     .catch (error => console.log ('erreur fetch api get : ', error));
// }


// retrieveDataApi();
// arrayProducts = retrieveDataApi();
// console.log('reponse: ', retrieveDataApi());
// console.log('arrayProducts: ', arrayProducts);
// async function remplissage() {
//     await retrieveDataApi();

//     // const functionAwait = await () {
//     //     console.log('arrayProducts : ', arrayProducts);
//     //     for (let product of arrayProducts) {    
//     //         console.log('produit : ', product);
        
//     //     }
//     // }
// };
// remplissage();




