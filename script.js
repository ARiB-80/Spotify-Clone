let playPauseBtn = document.querySelector(".play-pasue");
let currentSong = new Audio();
let currentlyPlaying = document.querySelector("#song-name");
let shuffleBtn = document.querySelector(".shuffle");
let loopBtn = document.querySelector(".loop");
let playlistCards; 
let songs;
let librarySongs;
// let folder;
let currentPlaylist ;
let currentPlaylistTitle;
let onShuffle = false;
let queue = [];
let onLoop = false;

async function getSongs(folder)
{
    /*https://spotify-clone-arib.freewebhostmost.com/songs/*/
    let songURL = await fetch(`/songs/${folder}/`);
    let songResponse = await songURL.text();
    // console.log(songResponse);
    let div = document.createElement("div");
    div.innerHTML = songResponse;
    let songLinks = div.querySelectorAll("a");
    
    let songs = [];
    for (const song of songLinks)
    {
        if(song.href.endsWith(".mp3"))
        songs.push(song.href);
    }
    return songs;
}

/*async function displayPlaylist()
{
    // https://github.com/ARiB-80/Spotify-Clone/tree/main/songs
    let folderURL = await fetch(`/songs/`);
    let songResponse = await folderURL.text();
    let div = document.createElement("div");
    div.innerHTML = songResponse;
    let folders = div.querySelectorAll("a");

    let playlistCardContainer = document.querySelector(".playlist-card-container");
    
    // for (const folder of folders)
    for(let i=0; i<folders.length;i++)
    {
        let folder = folders[i];
        
        if(folder.href.includes("/songs/") && !folder.href.includes(".htaccess"))
        {
            // console.log(folder)

            let playlistName = folder.href.split("/").slice(-2)[1];
            // console.log(playlistName)
            
            // let a = await fetch(`/songs/${playlistName}/info.json`);
            let a = await fetch(`/songs/${playlistName}/info.json`);
            let response = await a.json();
            
            playlistCardContainer.innerHTML += 
            `<div class="playlist-card" data-folder="${playlistName}">
                <img class="card-play-btn" src="svgs/card-play.svg" alt="card-play-btn">
                <img class="playlist-img" src="songs/${playlistName}/cover.png" alt="playlist-img">
                <div class="playlist-content">
                    <h2>${response.heading}</h2>
                    <p class="text-trim-2">${response.description}</p>
                </div>
            </div>`;

            // console.log(playlistCardContainer);
        }
    }
    
}*/


playlistCards = document.querySelectorAll(".playlist-card");


playlistCards.forEach((playlistCard)=>
{
    // console.log(playlistCard)
    playlistCard.addEventListener("click", (card)=>
    {
        currentPlaylist = card.currentTarget.dataset.folder;

        currentPlaylistTitle = document.querySelector(".songs-list span");

        currentPlaylistTitle.innerHTML = `Current Playlist : <b>${decodeURIComponent(currentPlaylist)}</b>`;

        queue = [];
        main(currentPlaylist);
    });
});

// displayPlaylist();   

async function main(currentPlaylist)
{
    songs = await getSongs(currentPlaylist);

    let songList = document.querySelector(".songs-list ul");
    
    songList.innerHTML ="";

    if(songs.length == 0)
    {
        songList.innerHTML = "<h3>No Songs in Playlist</h3>";
    }
    else
    {
        for (const song of songs)
        {
            songList.innerHTML += `<li value = "${song}"><p class="text-trim">${decodeURIComponent(song.split(`/${currentPlaylist}/`)[1]).replaceAll(".mp3", "")}</p></li>`;
        }
        currentSong.src = songs[0];
        playPauseSong()
        
        songList.children[0].style.color = "#48d178";
        songList.children[0].style.border = "1px solid #48d178"; 
        //-------------------------------------------
        currentlyPlaying.innerText = songList.children[0].innerText;
        
    }
    librarySongs = document.querySelectorAll(".songs-list ul li");

    
    for (const librarySong of librarySongs)
    {
        librarySong.addEventListener("click", ()=>
        {
            currentSong.src = librarySong.getAttribute("value");
            currentlyPlaying.innerText = librarySong.innerText;
            playPauseSong();
            changelibrarySong(librarySong);  
        });
    }
}

function changelibrarySong(librarySong)
{
    // console.log(librarySong)

    librarySongs.forEach((i)=>
    {
        i.style.color = "white";
        i.style.border = "1px solid rgba(255, 255, 255, 0.235)";
    });

    librarySong.style.color = "#48d178";
    librarySong.style.border = "1px solid #48d178"; 
}


function playPauseSong()
{
    currentSong.play();
    playPauseBtn.children[0].setAttribute("src",`svgs/pause.svg`);
    let isPlaying = !currentSong.paused;
    playPauseBtn.addEventListener("click", ()=>
    {
        if(!isPlaying)
        {
            currentSong.play();
            isPlaying = true;
            playPauseBtn.children[0].setAttribute("src",`svgs/pause.svg`);
        }
        else
        {
            currentSong.pause();
            isPlaying = false;
            playPauseBtn.children[0].setAttribute("src",`svgs/card-play.svg`);
        }
    });
}

document.querySelector(".prev-song").addEventListener("click",()=>
{
    let index = songs.indexOf(currentSong.src);
    let prevSong = queue.indexOf(currentSong.src);

    if(onLoop)
    {
        nextSong(index);
        playPauseSong();
        currentlyPlaying.innerText = librarySongs[index].innerText;
        changelibrarySong(librarySongs[index]);
    }
    else if(onShuffle && prevSong != 0)
    {
        
        // console.log("prevSong : ",prevSong);
        // console.log("index : ", index);
        
        index = songs.indexOf(queue[prevSong-1]);

        nextSong(index);
        playPauseSong();
        currentlyPlaying.innerText = librarySongs[index].innerText;
        changelibrarySong(librarySongs[index]);
    }
    else if(index > 0)
    {
        nextSong(index-1);   
        
        playPauseSong();
        currentlyPlaying.innerText = librarySongs[index-1].innerText;
        changelibrarySong(librarySongs[index-1]);
    }
});

document.querySelector(".next-song").addEventListener("click",()=>
{
    let index = songs.indexOf(currentSong.src);
    
    // currentSong.src = songs[index+1];
    if(onLoop)
    {
        nextSong(index);
        playPauseSong();
        currentlyPlaying.innerText = librarySongs[index].innerText;
        changelibrarySong(librarySongs[index]);
    }
    else if(onShuffle && queue.length < songs.length)
    {
        let nextSongIndex;
        let isInQueue = false;

        if(songs.length > 1)
        do
        {
            // console.log("searching neext song ");

            nextSongIndex = Math.floor(Math.random()*10);

            if((nextSongIndex != index) && (nextSongIndex < songs.length))
            for (let i = queue.length-1; i >= 0 ; i--)
            {
                if(songs[nextSongIndex] == queue[i])//4 -- 8 [5]
                {
                    isInQueue = true;
                    // console.log("queue[i] : ",queue[i]);
                    // console.log("songs[nextSongIndex] : ",songs[nextSongIndex]);
                    break;
                }
                else
                isInQueue = false;
           }
        
        }while((nextSongIndex == index) || (nextSongIndex > songs.length-1) || isInQueue);

        queue.push(songs[nextSongIndex]);
        // console.log("queue.length : ",queue.length);
        // console.log("songs.length : ",songs.length);


        nextSong(nextSongIndex);
        // console.log("nextSongIndex : ",nextSongIndex);
        playPauseSong();
        currentlyPlaying.innerText = librarySongs[nextSongIndex].innerText;
        changelibrarySong(librarySongs[nextSongIndex]);
    }
    else
    {
        if(index < songs.length -1)
        {
            // queue=[];
            nextSong(index+1);
            playPauseSong();
            currentlyPlaying.innerText = librarySongs[index+1].innerText;
            changelibrarySong(librarySongs[index+1]);
        }
    }
    // queue=[];
});


currentSong.addEventListener("timeupdate", ()=>
{
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector("#current-time").innerText = formatTime(currentSong.currentTime);
    document.querySelector("#full-duration").innerText = formatTime(currentSong.duration);
    
    let duration = document.querySelector(".duration");

    duration.style.width = `${(currentSong.currentTime/currentSong.duration)*100}%`;

    if(currentSong.currentTime === currentSong.duration)
    {
        playPauseBtn.children[0].setAttribute("src",`svgs/card-play.svg`);
        console.log("song ended")

        let index = songs.indexOf(currentSong.src)
        // currentSong.src = songs[index+1];
        let nextSongIndex;
        if(onLoop)
        {
            nextSongIndex = index;
        }
        else
        nextSongIndex = index+1;


        nextSong(nextSongIndex);
        changelibrarySong(librarySongs[nextSongIndex]);
        currentlyPlaying.innerText = librarySongs[nextSongIndex].innerText;
        playPauseSong();
    }

}); 

function nextSong(nextSongIndex)
{
    currentSong.src = songs[nextSongIndex];
}

document.querySelector(".song-duration-bar").addEventListener("click", (e)=>
{
    let songTimeChange = (e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".duration").style.width = `${songTimeChange}%`;
    currentSong.currentTime = (currentSong.duration*songTimeChange)/100;
});


function formatTime(seconds)
{
    // Round down the decimal seconds to the nearest whole number
    seconds = Math.floor(seconds);

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    let formattedMinutes = (minutes < 10 ? '0' : '') + minutes;
    let formattedSeconds = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

    if(formattedMinutes == "NaN" || formattedSeconds == "NaN")
    return "00:00";
    else
    return formattedMinutes + ':' + formattedSeconds;
}


// main();

let leftBar = document.querySelector(".left-bar");
document.querySelector(".hamburger").addEventListener("click",()=>
{
    leftBar.style.left = "0%";
});

document.querySelector(".cross").addEventListener("click",()=>
{
    leftBar.style.left = "-110%";
});

let volBar = document.querySelector(".volume-bar").getElementsByTagName("input")[0];
let currentVolume = 0.5;

volBar.value = currentVolume*100;

volBar.addEventListener("change", (e)=>
{
    // console.log(parseInt(e.target.value)/100)
    currentVolume = parseInt(e.target.value)/100;
    currentSong.volume = currentVolume;
});

let volumeButton = document.querySelector(".volume button");

volumeButton.addEventListener("click",()=>
{
    let volImg = volumeButton.children[0];
    
    // console.log(volImg.getAttribute("src"))
    if(volImg.getAttribute("src") == "svgs/volume.svg")
    {
        currentSong.volume = 0;
        volImg.setAttribute("src", "svgs/mute.svg");
        volBar.value = 0;
    }
    else
    {
        currentSong.volume = currentVolume;
        volImg.setAttribute("src", "svgs/volume.svg");
        volBar.value = currentVolume*100;
    }
});

shuffleBtn.addEventListener("click",()=>
{
    let shuffleBtnImg = shuffleBtn.children[0];

    if(shuffleBtnImg.getAttribute("src") == "svgs/shuffle-white.svg")
    {
        shuffleBtnImg.setAttribute("src", "svgs/shuffle-green.svg");
        onShuffle = true;
    }
    else
    {
        shuffleBtnImg.setAttribute("src", "svgs/shuffle-white.svg");
        onShuffle = false;
        queue = [];
    }
});


loopBtn.addEventListener("click", ()=>
{
    let loopBtnImg = loopBtn.children[0];

    if(loopBtnImg.getAttribute("src") == "svgs/loop-white.svg")
    {
        loopBtnImg.setAttribute("src", "svgs/loop-green.svg");
        onLoop = true;
    }
    else
    {
        loopBtnImg.setAttribute("src", "svgs/loop-white.svg");
        onLoop = false;
    }
});