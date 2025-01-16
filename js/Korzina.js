document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.querySelector('.cart-items');
    const totalCostElement = document.getElementById('total-cost');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    /*Загружает и отображает товары в корзине, рассчитывает и отображает итоговую стоимость*/
    function loadCartItems() {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            document.querySelector('.empty-cart').style.display = 'block';
            totalCostElement.textContent = '0 ₽';
            return;
        }
        document.querySelector('.empty-cart').style.display = 'none';
        let totalCost = 0;

        cart.forEach(productId => {
            fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${productId}?api_key=1fbab3bd-97a8-4f1f-933e-cba2bb1d3584`)
                .then(response => response.json())
                .then(product => {
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('cart-item');

                    let priceHtml = '';
                    let itemCost = 0;
                    if (product.discount_price !== null) {
                        priceHtml = `
                            <span class="old-price">${product.actual_price} ₽</span>
                            <span class="new-price">${product.discount_price} ₽</span>
                            <span class="discount">${calculateDiscount(product.actual_price, product.discount_price)}</span>
                        `;
                        itemCost = product.discount_price;
                    } else {
                        priceHtml = `<span class="actual-price">${product.actual_price} ₽</span>`;
                        itemCost = product.actual_price;
                    }

                    cartItem.innerHTML = `
                        <img src="${product.image_url}" alt="Изображение товара">
                        <h3>${product.name}</h3>
                        <div class="rating">${generateStars(product.rating)}</div>
                        <div class="price">
                            ${priceHtml}
                        </div>
                        <button class="remove-button" data-id="${product.id}">Удалить</button>
                    `;
                    cartItems.appendChild(cartItem);
                    totalCost += itemCost;
                    totalCostElement.textContent = `${totalCost} ₽`;
                })
                .catch(error => console.error('Error loading cart item:', error));
        });
    }

    /*Генерирует строку с звездами для отображения рейтинга товара*/
    function generateStars(rating) {
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                starsHtml += '★';
            } else {
                starsHtml += '☆';
            }
        }
        return starsHtml;
    }

    /*Вычисляет процент скидки на товар*/
    function calculateDiscount(actualPrice, discountPrice) {
        const discount = ((actualPrice - discountPrice) / actualPrice) * 100;
        return `-${discount.toFixed(0)}%`;
    }

    loadCartItems();

    cartItems.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-button')) {
            const productId = event.target.getAttribute('data-id');
            removeFromCart(productId, event.target.closest('.cart-item'));
        }
    });

    /*Удаляет товар из корзины и обновляет отображение и итоговую стоимость*/
    function removeFromCart(productId, cartItemElement) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(id => id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));

        if (cartItemElement) {
            cartItems.removeChild(cartItemElement);
        }

        let totalCost = 0;
        const promises = cart.map(productId =>
            fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${productId}?api_key=1fbab3bd-97a8-4f1f-933e-cba2bb1d3584`)
                .then(response => response.json())
                .then(product => {
                    if (product.discount_price !== null) {
                        totalCost += product.discount_price;
                    } else {
                        totalCost += product.actual_price;
                    }
                })
                .catch(error => console.error('Error loading cart item:', error))
        );

        Promise.all(promises).then(() => {
            totalCostElement.textContent = `${totalCost} ₽`;
            if (cart.length === 0) {
                document.querySelector('.empty-cart').style.display = 'block';
                totalCostElement.textContent = '0 ₽';
            }
        });
    }

    const orderForm = document.querySelector('.order-form form');
    orderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(orderForm);
        const order = {
            date: new Date().toISOString().split('T')[0],
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            deliveryDate: formData.get('delivery-date'),
            deliveryTime: formData.get('delivery-time'),
            content: cart.map(productId => productId),
            cost: totalCostElement.textContent,
            comment: formData.get('comment')
        };

        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=1fbab3bd-97a8-4f1f-933e-cba2bb1d3584', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        })
        .then(response => response.json())
        .then(data => {
            showModal('Заказ успешно оформлен!');
            orderForm.reset();
            cartItems.innerHTML = '';
            totalCostElement.textContent = '0 ₽';
            localStorage.removeItem('cart');
            document.querySelector('.empty-cart').style.display = 'block';

            window.location.href = 'LK.html';
        })
        .catch(error => {
            console.error('Ошибка при оформлении заказа:', error);
            showModal('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.');
        });
    });

    /*Отображает модальное окно с сообщением*/
    function showModal(message) {
        const modal = document.getElementById('modal');
        const modalMessage = document.getElementById('modal-message');
        const closeButton = document.querySelector('.close-button');

        modalMessage.textContent = message;
        modal.style.display = 'block';

        closeButton.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }
});
