
const stacks = document.querySelectorAll('.stack');
stacks.forEach(stack => {
    for (let i = 0; i < 15; i++) {
        const piece = document.createElement('div');
        piece.draggable = true;
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("text/plain", "dragging");
        });
        stack.appendChild(piece);
    }
});
