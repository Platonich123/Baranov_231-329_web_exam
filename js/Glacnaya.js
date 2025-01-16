document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.querySelector('.product-grid');
    const loadMoreButton = document.querySelector('.load-more');
    const sortSelect = document.getElementById('sortSelect');
    const applyButton = document.querySelector('.apply-button');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const subCategoryCheckboxes = document.querySelectorAll('input[name="sub_category"]');
    const minPriceInput = document.querySelector('input[name="min-price"]');
    const maxPriceInput = document.querySelector('input[name="max-price"]');
    const discountCheckbox = document.querySelector('input[name="discount"]');
    let currentPage = 1;
    const itemsPerPage = 6; 
    let allProducts = [];
    let filteredProducts = [];
    let sortedProducts = [];

    function loadProducts() {
        fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=1fbab3bd-97a8-4f1f-933e-cba2bb1d3584')
            .then(response => response.json())
            .then(data => {
                allProducts = data;
                filterAndSortProducts();
                displayProducts(currentPage);
            })
            .catch(error => console.error('Error loading products:', error));
    }

    function filterAndSortProducts() {
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value.toLowerCase());

        const selectedSubCategories = Array.from(subCategoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value.toLowerCase());

        const minPrice = parseFloat(minPriceInput.value);
        const maxPrice = parseFloat(maxPriceInput.value);
        const onlyDiscounted = discountCheckbox.checked;

        filteredProducts = allProducts.filter(product => {
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.main_category.toLowerCase());
            const subCategoryMatch = selectedSubCategories.length === 0 || selectedSubCategories.includes(product.sub_category.toLowerCase());
            const price = product.discount_price !== null ? product.discount_price : product.actual_price;
            const priceMatch = (price >= minPrice && price <= maxPrice);
            const discountMatch = !onlyDiscounted || (product.discount_price !== null && product.discount_price < product.actual_price);
            return categoryMatch && subCategoryMatch && priceMatch && discountMatch;
        });

        const sortOption = sortSelect.value;
        switch (sortOption) {
            case 'price-asc':
                sortedProducts = filteredProducts.sort((a, b) => {
                    const priceA = a.discount_price !== null ? a.discount_price : a.actual_price;
                    const priceB = b.discount_price !== null ? b.discount_price : b.actual_price;
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                sortedProducts = filteredProducts.sort((a, b) => {
                    const priceA = a.discount_price !== null ? a.discount_price : a.actual_price;
                    const priceB = b.discount_price !== null ? b.discount_price : b.actual_price;
                    return priceB - priceA;
                });
                break;
            case 'rating-asc':
                sortedProducts = filteredProducts.sort((a, b) => a.rating - b.rating);
                break;
            case 'default':
            default:
                sortedProducts = filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
        }

        console.log('Filtered Products:', filteredProducts);
        console.log('Sorted Products:', sortedProducts);
    }

    function displayProducts(page) {
        productGrid.innerHTML = ''; 
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const productsToDisplay = sortedProducts.slice(startIndex, endIndex);

        if (productsToDisplay.length > 0) {
            productsToDisplay.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');

                let priceHtml = '';
                if (product.discount_price !== null) {
                    priceHtml = `
                        <span class="old-price">${product.actual_price} ₽</span>
                        <span class="new-price">${product.discount_price} ₽</span>
                        <span class="discount">${calculateDiscount(product.actual_price, product.discount_price)}</span>
                    `;
                } else {
                    priceHtml = `<span class="actual-price">${product.actual_price} ₽</span>`;
                }

                productCard.innerHTML = `
                    <img src="${product.image_url}" alt="Изображение товара">
                    <h3>${product.name}</h3>
                    <div class="rating">${generateStars(product.rating)}</div>
                    <div class="price">
                        ${priceHtml}
                    </div>
                    <button class="add-to-cart" data-id="${product.id}">Добавить</button>
                `;
                productGrid.appendChild(productCard);
            });
        } else {
            loadMoreButton.style.display = 'none'; 
        }
    }

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

    function calculateDiscount(actualPrice, discountPrice) {
        const discount = ((actualPrice - discountPrice) / actualPrice) * 100;
        return `-${discount.toFixed(0)}%`;
    }

    loadProducts();

    loadMoreButton.addEventListener('click', function() {
        currentPage++;
        displayProducts(currentPage);
    });

    applyButton.addEventListener('click', function() {
        currentPage = 1;
        filterAndSortProducts();
        displayProducts(currentPage);
    });

    sortSelect.addEventListener('change', function() {
        currentPage = 1;
        filterAndSortProducts();
        displayProducts(currentPage);
    });

    productGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = event.target.getAttribute('data-id');
            addToCart(productId);
            event.target.classList.add('added');
        }
    });

    function addToCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!cart.includes(productId)) {
            cart.push(productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            showModal('Товар добавлен в корзину');
        } else {
            showModal('Товар уже в корзине');
        }
    }

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
