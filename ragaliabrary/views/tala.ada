<% layout('layout') -%>
<% title = 'Tala' %>
<h2>Tala List</h2>
<div class="container">
    <div class="talas">
        <% talas.forEach(tala => { %>
            <button onclick="loadTala(<%= tala.id %>)"><%= tala.name %></button>
        <% }); %>
    </div>
    <div class="tala-details" id="talaDetails">
        <!-- Tala details will load here -->
    </div>
</div>
<script>
    function loadTala(id) {
        fetch(`/tala/${id}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('talaDetails').innerHTML = `<h3>${data.name}</h3><p>${data.description}</p>`;
            });
    }
</script>