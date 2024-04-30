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

// // Load state from storage when the popup is opened
// window.addEventListener('load',function() {
//     chrome.storage.sync.get(['seconds', 'minutes', 'hours', 'timerStatus','removeAllFieldCheckbox'], function(data) {
//         if (data.seconds !== undefined) seconds = data.seconds;
//         if (data.minutes !== undefined) minutes = data.minutes;
//         if (data.hours !== undefined) hours = data.hours;
//         if (data.timerStatus !== undefined) timerStatus = data.timerStatus;
//         if (data.removeAllFieldCheckbox !== undefined) document.getElementById('removeAllFieldCheckbox').checked = data.removeAllFieldCheckbox;

//         if (timerStatus === "started") {
//             interval = window.setInterval(stopwatch, 1000);
//             document.getElementById("start").innerHTML = "<i class='fas fa-pause'></i>";
//         }

//         updateClockDisplay();
//         // stopwatch();
//     });
// });
// // Save state to storage when the popup is closed
// window.addEventListener('unload', function() {
//     chrome.storage.sync.set({
//         'seconds': seconds,
//         'minutes': minutes,
//         'hours': hours,
//         'timerStatus': timerStatus,
//         // 'removeAllFieldCheckbox': checked
//     });
// });




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

chrome.storage.sync.get(['removeCurrentTopicCheckbox'], function(data) {
    if(data.removeCurrentTopicCheckbox) {
        let currentVideoTitle = document.querySelector('#title.style-scope.ytd-watch-metadata').innerText;
        let recommendedVideos = document.querySelectorAll('#video-title.style-scope.ytd-compact-video-renderer');

        recommendedVideos.forEach(video => {
            let videoTitle = video.innerText;
            let currentVideoWords = currentVideoTitle.split(' ');

            currentVideoWords.forEach(word => {
                if(videoTitle.includes(word)) {
                    video.parentElement.parentElement.style.display = 'none';
                }
            });
        });
    }
});

