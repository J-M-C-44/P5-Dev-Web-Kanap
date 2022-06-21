'use strict';

// 1) on récupère le N° de commande
const orderId = retrieveID();

// 2) on affiche le N° de commande
document
        .getElementById('orderId')
        .textContent = orderId;


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