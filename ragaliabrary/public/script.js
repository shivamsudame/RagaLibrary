// This file can be used to manage colors, fonts, and other UI-related configurations.

document.addEventListener("DOMContentLoaded", () => {
    // Sample color change functionality
    const body = document.body;
    
    // Change colors on button click for demonstration
    const colorButton = document.getElementById("changeColor");
    if (colorButton) {
        colorButton.addEventListener("click", () => {
            body.style.backgroundColor = body.style.backgroundColor === "lightblue" ? "white" : "lightblue";
            body.style.color = body.style.color === "black" ? "blue" : "black";
        });
    }
});

// Function to toggle favorite status
function toggleFavorite(ragaId, isFavorite) {
    const url = isFavorite ? `/raga/favorite/${ragaId}` : `/raga/unfavorite/${ragaId}`;
    
    fetch(url, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                // Reload the page after successful favorite/unfavorite
                window.location.reload();
            } else {
                console.error('Error toggling favorite status');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
