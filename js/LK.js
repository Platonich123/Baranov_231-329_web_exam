document.addEventListener('DOMContentLoaded', function() {
    const ordersTable = document.querySelector('.orders-table tbody');
    const viewModal = document.getElementById('viewModal');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeButtons = document.querySelectorAll('.close-button');
    const saveButton = editModal.querySelector('.save-button');
    const cancelButtons = document.querySelectorAll('.cancel-button');
    const confirmButton = deleteModal.querySelector('.confirm-button');
    const editForm = editModal.querySelector('form');

    function loadOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        ordersTable.innerHTML = '';
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.date}</td>
                <td>${order.content.join(', ')}</td>
                <td>${order.cost} ₽</td>
                <td>${order.deliveryDate} ${order.deliveryTime}</td>
                <td>
                    <button class="view-button" data-id="${index}">Просмотр</button>
                    <button class="edit-button" data-id="${index}">Редактирование</button>
                    <button class="delete-button" data-id="${index}">Удаление</button>
                </td>
            `;
            ordersTable.appendChild(row);
        });
    }

    loadOrders();

    ordersTable.addEventListener('click', function(event) {
        if (event.target.classList.contains('view-button')) {
            const orderId = event.target.getAttribute('data-id');
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = orders[orderId];
            viewModal.querySelector('#viewDate').textContent = order.date;
            viewModal.querySelector('#viewName').textContent = order.name;
            viewModal.querySelector('#viewPhone').textContent = order.phone;
            viewModal.querySelector('#viewEmail').textContent = order.email;
            viewModal.querySelector('#viewAddress').textContent = order.address;
            viewModal.querySelector('#viewDeliveryDate').textContent = order.deliveryDate;
            viewModal.querySelector('#viewDeliveryTime').textContent = order.deliveryTime;
            viewModal.querySelector('#viewOrderContent').textContent = order.content.join(', ');
            viewModal.querySelector('#viewCost').textContent = order.cost;
            viewModal.querySelector('#viewComment').textContent = order.comment;
            viewModal.style.display = 'block';
        } else if (event.target.classList.contains('edit-button')) {
            const orderId = event.target.getAttribute('data-id');
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = orders[orderId];
            editForm.editDate.value = order.date;
            editForm.editName.value = order.name;
            editForm.editPhone.value = order.phone;
            editForm.editEmail.value = order.email;
            editForm.editAddress.value = order.address;
            editForm.editDeliveryDate.value = order.deliveryDate;
            editForm.editDeliveryTime.value = order.deliveryTime;
            editForm.editOrderContent.value = order.content.join(', ');
            editForm.editCost.value = order.cost;
            editForm.editComment.value = order.comment;
            editModal.style.display = 'block';
            saveButton.setAttribute('data-id', orderId);
        } else if (event.target.classList.contains('delete-button')) {
            const orderId = event.target.getAttribute('data-id');
            deleteModal.style.display = 'block';
            confirmButton.setAttribute('data-id', orderId);
        }
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewModal.style.display = 'none';
            editModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });

    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewModal.style.display = 'none';
            editModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });

    saveButton.addEventListener('click', function() {
        const orderId = saveButton.getAttribute('data-id');
        const formData = new FormData(editForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders[orderId] = {
            date: data.editDate,
            name: data.editName,
            phone: data.editPhone,
            email: data.editEmail,
            address: data.editAddress,
            deliveryDate: data.editDeliveryDate,
            deliveryTime: data.editDeliveryTime,
            content: data.editOrderContent.split(',').map(id => id.trim()),
            cost: data.editCost,
            comment: data.editComment
        };
        localStorage.setItem('orders', JSON.stringify(orders));

        showNotification('Заказ успешно обновлен', 'success');
        editModal.style.display = 'none';
        loadOrders();
    });

    confirmButton.addEventListener('click', function() {
        const orderId = confirmButton.getAttribute('data-id');
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.splice(orderId, 1);
        localStorage.setItem('orders', JSON.stringify(orders));

        showNotification('Заказ успешно удален', 'success');
        deleteModal.style.display = 'none';
        loadOrders();
    });

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    }
});