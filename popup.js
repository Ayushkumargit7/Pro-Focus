let removeAllFieldCheckbox = document.getElementById("removeAllFieldCheckbox");

removeAllFieldCheckbox.addEventListener("click", async () => {
    // get the current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: (removeAllFieldCheckbox.checked) ? removeAllFields : showAllFields,
    });
});

function removeAllFields() {

    // get the right-hand sidebar where recommended videos usually appear
    let sidebar = document.querySelector("#secondary.style-scope.ytd-watch-flexy");

    // hide the side bar
    if (sidebar) {
        sidebar.style.display = "none";
    }
}

function showAllFields() {
    // get the right-hand sidebar where recommended videos usually appear
    let sidebar = document.querySelector("#secondary.style-scope.ytd-watch-flexy");

    // show the side bar
    if (sidebar) {
        sidebar.style.display = "block";
    }
}

removeCurrentTopicCheckbox.addEventListener("click", async () => {
    // get the current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: (removeCurrentTopicCheckbox.checked) ? removeUnrelatedVideos : showAllFields,//showAllFields see it .
    });
});

// Function to remove unrelated videos
function removeUnrelatedVideos() {

    function compareTwoStrings(first, second) {
        first = first.replace(/\s+/g, '')
        second = second.replace(/\s+/g, '')
    
        if (first === second) return 1; // identical or empty
        if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string
    
        let firstBigrams = new Map();
        for (let i = 0; i < first.length - 1; i++) {
            const bigram = first.substring(i, i + 2);
            const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram) + 1
                : 1;
    
            firstBigrams.set(bigram, count);
        };
    
        let intersectionSize = 0;
        for (let i = 0; i < second.length - 1; i++) {
            const bigram = second.substring(i, i + 2);
            const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram)
                : 0;
    
            if (count > 0) {
                firstBigrams.set(bigram, count - 1);
                intersectionSize++;
            }
        }
    
        return (2.0 * intersectionSize) / (first.length + second.length - 2);
    }

    // Get the title of the current video
    let currentVideoTitle = document.querySelector('#title.style-scope.ytd-watch-metadata').innerText;

    // Get all recommended videos
    let recommendedVideos = document.querySelectorAll('ytd-compact-video-renderer');

    // Iterate over each recommended video
    recommendedVideos.forEach(video => {
        // Get the title of the recommended video
        let videoTitle = video.querySelector('#video-title').innerText;

        let similarity = compareTwoStrings(currentVideoTitle, videoTitle);

        // Debugging output: Log the distance
        console.log(`Title: ${videoTitle}, Distance: ${similarity}`);
        console.log(similarity);

        // Set a threshold for relatedness
        const threshold = 0.29; // Adjust this value as needed

        // If the distance is below the threshold, consider them related and show the video
        if (similarity <= threshold) {
            video.style.display = 'none'; // or 'inline' depending on the video's default display property
        } else {
            video.style.display = 'block';
        }
    });
}


const clock = document.getElementById("clock");
let timerInterval;
let timerStatus = "stopped";
let currTime = 0;
let startTime = new Date().getTime();
let timeDifference = 0;
let displaySeconds = 0, displayMinutes = 0, displayHours = 0;

chrome.storage.sync.get(['startTime','timerStatus','currTime','displaySeconds','displayMinutes','displayHours','removeAllFieldCheckbox'], function(data) {

    startTime = data.startTime;
    timerStatus = data.timerStatus;
    currTime = data.currTime;
    displaySeconds = data.displaySeconds;
    displayMinutes = data.displayMinutes;
    displayHours = data.displayHours;

    removeAllFieldCheckbox.checked = data.removeAllFieldCheckbox;
    clock.innerHTML = displayHours + ":" + displayMinutes + ":" + displaySeconds;

    if(timerStatus === "started") {
        timerInterval = setInterval(timerUpdate, 1000);
        document.getElementById("start").style.display = "none";
        document.getElementById("pause").style.display = "block";
        // document.getElementById("pause").innerHTML = "<i class='fas fa-pause'></i>";
    }
    else{
        document.getElementById("start").style.display = "block";
        // document.getElementById("start").innerHTML = "<i class='fas fa-play'></i>";
        document.getElementById("pause").style.display = "none";
    }
});

document.getElementById('removeAllFieldCheckbox').addEventListener('change', function() {
    chrome.storage.sync.set({
        'removeAllFieldCheckbox': this.checked
    });
});

document.getElementById('start').addEventListener('click', function() {

    if(timerStatus === "stopped") {
        // document.getElementById("start").innerHTML = "Resume";
        document.getElementById("start").style.display = "none";
        document.getElementById("pause").style.display = "block";
        timerStatus = "started";
        chrome.storage.sync.set({   
            'timerStatus': timerStatus        
        });
        chrome.storage.sync.get(['currTime'], function(data) {
            currTime = data.currTime;
        });
        startTime = new Date().getTime();
        timerInterval = setInterval(timerUpdate, 1000);
    }

});

document.getElementById('pause').addEventListener('click', function() {
    clearInterval(timerInterval);
    timerStatus = "stopped";
    document.getElementById("start").style.display = "block";
    document.getElementById("pause").style.display = "none";
    chrome.storage.sync.set({
        'timerStatus': timerStatus,
        'currTime': timeDifference,
        'displaySeconds': displaySeconds,
        'displayMinutes': displayMinutes,
        'displayHours': displayHours
    });

});


document.getElementById('reset').addEventListener('click', function() {
    clearInterval(timerInterval);
    clock.innerHTML = "00:00:00";
    timerStatus = "stopped";
    // document.getElementById("start").innerHTML = "Start";
    document.getElementById("start").style.display = "block";
    document.getElementById("pause").style.display = "none";
    startTime = new Date().getTime();
    chrome.storage.sync.set({
        'startTime': startTime,
        'timerStatus': timerStatus,
        'currTime': 0,
        'displaySeconds': '00',
        'displayMinutes': '00',
        'displayHours': '00'
    });
});


const timerUpdate = () =>{
    let currentTime = new Date().getTime();
    timeDifference = currentTime - startTime + currTime;
    seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    displaySeconds = seconds < 10 ? "0" + seconds.toString() : seconds;
    displayMinutes = minutes < 10 ? "0" + minutes.toString() : minutes;
    displayHours = hours < 10 ? "0" + hours.toString() : hours;

    clock.innerHTML = displayHours + ":" + displayMinutes + ":" + displaySeconds;

    chrome.storage.sync.set({
        'startTime': startTime,
        'timerStatus': timerStatus,
        'displaySeconds': displaySeconds,
        'displayMinutes': displayMinutes,
        'displayHours': displayHours,
    });
}

document.getElementById('removeCurrentTopicCheckbox').addEventListener('change', function() {
    chrome.storage.sync.set({
        'removeCurrentTopicCheckbox': this.checked
    });
});

