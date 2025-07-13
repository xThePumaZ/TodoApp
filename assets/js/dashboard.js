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
                if (list.getAttribute('data-status') !== source.element.getAttribute('data-status')) {
                    fetch(`/task/update_status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            task_id: source.element.getAttribute('data-task-id'),
                            status: list.getAttribute('data-status'),
                        }),
                    }).then(r => {
                        if (r.status === 200) {
                            list.appendChild(source.element);
                        } else {
                            throw new Error('Network response was not ok');
                        }
                    });

                }
            },
        });
    })
});
