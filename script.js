// JavaScript file (script.js)

window.onload = function() {
    loadSavedLinks();
};

function loadSavedLinks() {
    var savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
    var savedLinksDiv = document.getElementById("savedLinks");
    savedLinksDiv.innerHTML = '';
    savedLinks.forEach(function(link) {
        var linkDiv = createSavedLinkDiv(link);
        savedLinksDiv.appendChild(linkDiv);
    });
}

function createSavedLinkDiv(link) {
    var linkDiv = document.createElement("div");
    linkDiv.classList.add("saved-link");

    // Create thumbnail image element
    var thumbnailImg = document.createElement("img");
    thumbnailImg.src = "https://img.youtube.com/vi/" + extractVideoId(link.url) + "/default.jpg";
    thumbnailImg.alt = "Video Thumbnail";
    thumbnailImg.classList.add("thumbnail");
    linkDiv.appendChild(thumbnailImg);

    // Create link text
    var linkText = document.createElement("span");
    linkText.textContent = link.title;
    linkDiv.appendChild(linkText);

    linkDiv.onclick = function() {
        playVideo(link.url);
    };

    var deleteButton = document.createElement("span");
    deleteButton.classList.add("delete-link");
    deleteButton.textContent = "❌";
    deleteButton.onclick = function(event) {
        event.stopPropagation();
        deleteLink(link);
    };
    linkDiv.appendChild(deleteButton);

    return linkDiv;
}

function saveLink(videoId, title) {
    var savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
    var link = { url: "https://www.youtube.com/watch?v=" + videoId, title: title };
    if (!savedLinks.some(item => item.url === link.url)) {
        savedLinks.push(link);
        localStorage.setItem("savedLinks", JSON.stringify(savedLinks));
        loadSavedLinks();
    }
}

function deleteLink(link) {
    var savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
    var index = savedLinks.findIndex(item => item.url === link.url);
    if (index !== -1) {
        savedLinks.splice(index, 1);
        localStorage.setItem("savedLinks", JSON.stringify(savedLinks));
        loadSavedLinks();
    }
}

function clearSavedLinks() {
    localStorage.removeItem("savedLinks");
    loadSavedLinks();
}

function shuffleAndPlay() {
    var savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
    if (savedLinks.length > 0) {
        var currentVideoId = document.getElementById("player").querySelector("iframe")?.src.match(/(?:embed\/)([a-zA-Z0-9_-]{11})/)[1];
        var filteredLinks = savedLinks.filter(link => extractVideoId(link.url) !== currentVideoId);

        if (filteredLinks.length > 0) {
            var randomIndex = Math.floor(Math.random() * filteredLinks.length);
            var randomLink = filteredLinks[randomIndex];
            playVideo(randomLink.url);
        } else {
            alert("There are no saved links to shuffle.");
        }
    } else {
        alert("There are no saved links to shuffle.");
    }
}

function searchVideo() {
    var searchQuery = document.getElementById("searchQuery").value;
    var apiKey = 'AIzaSyDv2iDbhYS_c7giiJnkjQ5aeGg9QPA6rMQ';
    var url = 'https://www.googleapis.com/youtube/v3/search?key=' + apiKey + '&part=snippet&type=video&q=' + searchQuery;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.items.length === 0) {
            showError("Video not found. Please try another search query.");
            return;
        }
        var videoId = data.items[0].id.videoId;
        var title = data.items[0].snippet.title;
        var playerDiv = document.getElementById("player");
        playerDiv.innerHTML = '<iframe id="videoPlayer" width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
        
        var saveButton = document.createElement("button");
        saveButton.textContent = "Save to Playlist";
        saveButton.onclick = function() {
            saveLink(videoId, title);
        };

        var buttonDiv = document.createElement("div");
        buttonDiv.appendChild(saveButton);
        playerDiv.appendChild(buttonDiv);
    })
    .catch(error => {
        console.error('Error:', error);
        showError("Error fetching video. Please try again later.");
    });
}

function playVideo(youtubeLink) {
    var videoId = extractVideoId(youtubeLink);
    if(videoId !== null) {
        var playerDiv = document.getElementById("player");
        playerDiv.innerHTML = '<iframe id="videoPlayer" width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
    } else {
        alert("Invalid YouTube link. Please enter a valid link.");
    }
}

function extractVideoId(link) {
    var regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    var match = link.match(regex);
    return match ? match[1] : null;
}

function showError(message) {
    var playerDiv = document.getElementById("player");
    playerDiv.innerHTML = '<p style="color: red;">' + message + '</p>';
}
