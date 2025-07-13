import {draggable, dropTargetForElements} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

document.addEventListener('DOMContentLoaded', function () {
    const list = document.querySelectorAll('.task-list');

    list.forEach(list => {
        const items = list.querySelectorAll('.task-item');
        // Draggable Items initialisieren
        items.forEach(item => {
            draggable({
                element: item,
            });
        });

        // DropTarget für die Liste
        dropTargetForElements({
            element: list,
            onDrop({source}) {
                console.log('list:', list);
                console.log('Item dropped:', source.element);

                var listStatus = list.getAttribute('data-status');
                var itemId = source.element.getAttribute('data-task-id');

                const response =  fetch(`/task/update_status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        task_id: itemId,
                        status: listStatus,
                    }),
                }).then(r => {
                    if (r.status === 200) {
                        list.appendChild(source.element);
                        return r.json();
                    } else {
                        throw new Error('Network response was not ok');
                    }

                });

            },
        });
    })
});
