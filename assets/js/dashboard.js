import Sortable from 'sortablejs';


document.querySelectorAll('.task-list').forEach(list => {
    new Sortable(list, {
        group: 'tasks',
        animation: 150,
        onEnd: function (evt) {
            const taskId = evt.item.dataset.taskId;
            const newStatus = evt.to.dataset.status;
            // Optional: AJAX-Request an Backend, um Status zu speichern
            // z.B. fetch('/task/' + taskId + '/move', {method: 'POST', body: JSON.stringify({status: newStatus})})
        }
    });
});
