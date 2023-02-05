// Set Option
let current_artist = 0,
    currentTime = 0,
    numberOfArtist,
    duration,
    idInterval,
    clicked_search,
    btn_like;

// Get Element
const card_song = document.querySelectorAll(".songs-popular .songs");
const time_line = document.querySelector("[name='audio-timeline']");
const img_audio_now = document.querySelector(".info-audio-now>img");
const previous_artist = document.getElementById("previous-artist");
const info_audio = document.querySelector(".info-audio-now>.info");
const previous_audio = document.querySelector("#previous-audio");
const volume_slider = document.querySelector("[name='volume']");
const previous_song = document.querySelector("#previous-song");
const songs_popular = document.querySelector(".songs-popular");
const cancel_search = document.querySelector("#cancel-search");
const input_search = document.querySelector("[type='search']");
const intro_artist = document.querySelector(".intro-artist");
const res_search = document.querySelector(".result-search");
const next_artist = document.getElementById("next-artist");
const play_audio = document.querySelector("#play-audio>i");
const player_container = document.querySelector(".player");
const next_audio = document.querySelector("#next-audio");
const next_song = document.getElementById("next-song");
const shuffle_btn = document.querySelector("#shuffle");
const time_curr = document.querySelector(".curr-time");
const css_variable = document.querySelector(":root");
const time_end = document.querySelector(".time-end");
const volume_btn = document.querySelector("#volume");
const text_error = document.querySelector(".error");
const player_mp3 = document.querySelector("audio");
const section = document.querySelector("section");
const loaded = document.querySelector(".loaded");
const loop_btn = document.querySelector("#loop");
const song_name_place = info_audio.children[0];
const team_place = info_audio.children[1];

previous_audio.onclick = () => previous(document.querySelectorAll(".play>i"));
shuffle_btn.onclick = (e) => shuffle(document.querySelectorAll(".play>i"), e);
previous_song.onclick = () => scrollSongs(-songs_popular.clientWidth);
next_audio.onclick = () => next(document.querySelectorAll(".play>i"));
next_song.onclick = () => scrollSongs(songs_popular.clientWidth);
volume_slider.oninput = () => updateVolume(volume_slider.value);
time_line.oninput = () => startSpecific(time_line.value);
songs_popular.onclick = (e) => startAudio(e.target);
previous_artist.onclick = () => previousArtist();
volume_btn.onclick = () => updateVolume(0);
loop_btn.onclick = () => activeLoopAudio();
next_artist.onclick = () => nextArtist();
document.body.onload = () => getData();

function getData() {
    fetch("../data/data.json")
        .then((response) => {
            loading(false);
            return response.json();
        })
        .then((data) => {
            numberOfArtist = data.length;
            return data;
        })
        .then((data) => {
            const artist = data[current_artist];
            createCardSong(artist, sortByVue(artist.songs));
            return data;
        })
        .then((data) => {
            loading(true);
            return data;
        })
        .then((data) => {
            checkInputSearch(data);
            return data;
        })
        .catch((data) => {
            showError();
        });
}

function showError() {
    loading(false);
    text_error.id = "have-error";
    loading(true);
}

function checkInputSearch(data) {
    input_search.onfocus = function() {
        cancel_search.style.display = checkMobile() ? "Initial" : "none";
        input_search.oninput = () =>
            notEmpty() ? search(data, this.value) : (res_search.innerHTML = "");

        input_search.onblur = (event) => {
            setTimeout(() => hiddenResult(), 500);
            event.preventDefault();
        };
    };

    function checkMobile() {
        return document.body.clientWidth <= 768;
    }

    function notEmpty() {
        return input_search.value != "";
    }
}

function search(data, val) {
    res_search.innerHTML = "";
    let reg = new RegExp(val, "i");
    data.forEach((artist) => {
        const cat = artist.name.slice(0, val.length);
        if (cat.match(reg)) {
            resultArtist(artist, false);
        }
        artist.songs.forEach((song) => {
            const catName = song.name.slice(0, val.length);
            const catTeam = song.team.slice(0, val.length);
            if (catName.match(reg) || catTeam.match(reg)) {
                resultArtist(song, true);
            }
        });
    });
    checkClickedResult();
}

function checkClickedResult() {
    res_search.childNodes.forEach((e) => getClicked(e));
}

function getClicked(e) {
    e.onclick = function() {
        e.className == "song-res" ? startAudio(e) : specificArtist(e);
    };
}

function specificArtist(e) {
    current_artist = +e.dataset.artist;
    getData();
    hiddenResult();
}

function hiddenResult() {
    input_search.value = "";
    res_search.style.display = "none";
    cancel_search.style.display = "none";
}

function resultArtist(found, check_song) {
    let li_artist = createLi();
    addDataSet(found);
    let img_artist = createImage();
    let info_artist = createInfo();
    let name_artist = createNameArtist();
    if (check_song) {
        let name_song = createNameSong();
        info_artist.appendChild(name_song);
    }
    appendEle();
    showResult();

    function createLi() {
        let li = document.createElement("li");
        li.id = "play-this";
        li.className = check_song ? "song-res" : "artist-res";
        return li;
    }

    function addDataSet() {
        li_artist.dataset.dirSong = check_song ? found["song-dir"] : found.index;
        li_artist.dataset.dirImg = check_song ? found["image-song-dir"] : null;
        li_artist.dataset.team = check_song ? found.team : null;
        li_artist.dataset.name = check_song ? found.name : null;
        li_artist.dataset.artist = check_song ? null : found.index;
    }

    function createImage() {
        let img = document.createElement("img");
        img.src = check_song ? found["image-song-dir"] : found.wallpaper;
        return img;
    }

    function createInfo() {
        let info = document.createElement("div");
        info.className = "info";
        return info;
    }

    function createNameArtist() {
        let name_artist = document.createElement("span");
        name_artist.className = "artist";
        name_artist.innerHTML = check_song ? found.team : found.name;
        return name_artist;
    }

    function createNameSong() {
        let name = document.createElement("span");
        name.className = "song";
        name.innerHTML = found.name;
        return name;
    }

    function showResult() {
        res_search.style.display = res_search.hasChildNodes() ? "Initial" : "none";
    }

    function appendEle() {
        li_artist.appendChild(img_artist);
        info_artist.appendChild(name_artist);
        li_artist.appendChild(info_artist);
        res_search.appendChild(li_artist);
    }
}

function createCardSong(artist, sortByVue) {
    // Emptying Songs Popular
    songs_popular.innerHTML = "";

    changeStylePage();

    addIntroArtist();

    sortByVue.forEach((song, index) => {
        // Create Card div
        const card = createCard(song);

        // Create Div Info Songs
        const info_songs = document.createElement("div");
        info_songs.classList.add("info-song");

        // Create Info Control + Button Play + Like
        const info_control = createInfoControl(song, info_songs);

        // Create Name Song + Team Song + Vue Song
        createInfoSongText(info_songs, song);

        // Append Info Songs To Card
        card.appendChild(info_songs);
        songs_popular.appendChild(card);
    });

    function changeStylePage() {
        // Specific Color For Any Artist
        css_variable.style.setProperty("--special-Color", artist.color);

        // Add Wallpaper For Artist In Section
        section.style.backgroundImage = `url(${artist.wallpaper})`;
    }

    function addIntroArtist() {
        // Add Artist Name
        intro_artist.children[0].children[1].innerHTML = artist.name;

        // Add Artist Intro
        intro_artist.children[1].innerHTML = artist.intro;
    }

    function createCard(song) {
        // Create Div
        const card = document.createElement("div");
        card.classList.add("songs");

        // Create Image Song
        let img = document.createElement("img");
        img.setAttribute("src", song["image-song-dir"]);

        // Append Image To Card
        card.appendChild(img);

        return card;
    }

    function createInfoControl(song, info_songs) {
        // Create Div Info Control
        const info_control = document.createElement("div");
        info_control.classList.add("btn-control");

        // Create Button Play
        const play = document.createElement("button");
        play.classList.add("play");

        // Create Play Icon And Add Data Set We Needed For Play Song
        const play_icon = document.createElement("i");
        play_icon.className = "fa-regular fa-circle-play";
        play_icon.setAttribute("id", "play-this");
        play_icon.dataset.dirSong = song["song-dir"];
        play_icon.dataset.dirImg = song["image-song-dir"];
        play_icon.dataset.name = song.name;
        play_icon.dataset.team = song.team;

        // Create Button Like
        const like = document.createElement("button");
        like.classList.add("like");

        // Create Like Icon
        const like_icon = document.createElement("i");
        like_icon.className = "fa-regular fa-heart";

        // Append Icon To Button
        play.appendChild(play_icon);
        like.appendChild(like_icon);

        // Append Button To Info Control
        info_control.appendChild(play);
        info_control.appendChild(like);

        // Append Info Control To Info Songs
        info_songs.appendChild(info_control);
    }

    function createInfoSongText(info_songs, song) {
        // Create Name Song
        const name_song = document.createElement("span");
        name_song.innerHTML = song.name;
        name_song.classList.add("name-songs");
        name_song.dataset.category = "Song: ";

        // Append Name Song To Info Song
        info_songs.appendChild(name_song);

        // Create Team Song
        const team_song = document.createElement("span");
        team_song.innerHTML = song.team;
        team_song.classList.add("team-songs");
        team_song.dataset.category = "Team: ";

        // Append Team Song To Info Song
        info_songs.appendChild(team_song);

        // Create Vue Song
        const vue_song = document.createElement("span");
        vue_song.innerHTML = song.vue;
        vue_song.classList.add("vues-songs");
        vue_song.dataset.category = "Vue: ";

        // Append Vue Song To Info Song
        info_songs.appendChild(vue_song);
    }
}

function sortByVue(songs) {
    // !Error if equal vue
    let vue = [];
    let songsObject = [];
    for (let i = 0; i < songs.length; i++) {
        vue[i] = parseFloat(songs[i].vue);
    }
    vue.sort((a, b) => b - a);
    vue.forEach((e, i) => {
        songs.forEach((song) => {
            if (e == parseFloat(song.vue)) {
                songsObject[i] = song;
            }
        });
    });
    vue = null;
    return songsObject;
}

function scrollSongs(val) {
    songs_popular.scrollBy(val, 0);
}

function previousArtist() {
    if (current_artist != 0) {
        current_artist--;
        getData();
    }
}

function nextArtist() {
    if (current_artist < numberOfArtist - 1) {
        current_artist++;
        getData();
    }
}

function loading(check) {
    const main = document.querySelector("main");
    check ? turnOf() : turn();

    function turn() {
        loaded.id = "loading";
        main.id = "hidden-app";
    }

    function turnOf() {
        loaded.removeAttribute("id");
        if (text_error.id == "") {
            main.removeAttribute("id");
        }
    }
}

function startAudio(target) {
    // Check If Play Or Pause
    if (target.id == "play-this") {
        hiddenResult();
        play(target);
    } else if (target.id == "pause-this") {
        pause(target);
    }
    play_audio.onclick = () => {
        play_audio.id == "play" ? play(target) : pause(target);
    };
}

function play(target) {
    // Remove All Id For Change Icon And Add Id To Target
    removeAllId(document.querySelectorAll(".play >i"), target);

    // Show Player Mp3
    showAudioPlayer(target);

    // Scroll Text
    scrollText(team_place);
    scrollText(song_name_place);

    // Add Current Time For Play from It If Paused Song In Any Time
    player_mp3.currentTime = currentTime;

    // Get Duration Of Current Song
    player_mp3.onloadedmetadata = () => getDurationSong();

    // Play Current Song
    player_mp3.play();

    // Start Counter Current Time
    idInterval = setInterval(() => startCounter(), 1000);

    function removeAllId(ele, target) {
        // Remove All Id "play-this" After Click Play In Any Songs
        ele.forEach((element) => (element.id = "play-this"));

        // Add Id"pause-this" In Specific Element Clicked
        target.setAttribute("id", "pause-this");

        play_audio.id = "pause";
    }

    function scrollText(ele) {
        let scrolled;
        setInterval(() => {
            ele.scrollBy(1, 0);
            scrolled = Math.ceil(ele.scrollLeft + ele.clientWidth);
            if (scrolled == ele.scrollWidth) {
                ele.scrollBy(-scrolled, 0);
            }
        }, 100);
    }

    function getDurationSong() {
        // Get Duration Songs => Hours Minutes Seconds
        let seconds = Math.floor(player_mp3.duration % 60);
        let minuets = Math.floor(player_mp3.duration / 60);
        let hours = Math.floor(minuets / 60);

        // Check If Add 0 Or No
        seconds = seconds < 10 ? `0${seconds}` : seconds;
        minuets = minuets < 10 ? `0${minuets}` : minuets;
        hours = hours < 10 ? `0${hours}` : hours;

        // If Duration Songs < 60min Don't Add Hours
        duration = `${hours <= 0 ? "" : hours + ":"}${minuets}:${seconds}`;

        // Show Song Duration In Time End
        time_end.innerHTML = duration;

        // Add ValueMax = Duration Of Songs, For Input:Range
        time_line.setAttribute("max", Math.floor(player_mp3.duration));
    }
}

function pause(target) {
    target.setAttribute("id", "play-this");
    play_audio.id = "play";
    img_audio_now.style.animationPlayState = "paused";
    currentTime = player_mp3.currentTime;
    player_mp3.pause();
}

function showAudioPlayer(target) {
    // Up Audio Player
    player_container.style.bottom = "0";

    // Add Image Song In Player Mp3

    img_audio_now.setAttribute("src", target.dataset.dirImg);

    // Start Animation
    img_audio_now.style.animationPlayState = "running";

    // Add Source Song In Player Mp3
    player_mp3.setAttribute("src", target.dataset.dirSong);

    // Add Team + Name Song
    team_place.innerHTML = target.dataset.team;
    song_name_place.innerHTML = target.dataset.name;

    console.log(player_mp3);
}

function startCounter() {
    let cMinutes = Math.floor(player_mp3.currentTime / 60);
    let cSeconds = Math.floor(player_mp3.currentTime - cMinutes * 60);
    cMinutes = cMinutes < 10 ? `0${cMinutes}` : cMinutes;
    cSeconds = cSeconds < 10 ? `0${cSeconds}` : cSeconds;

    counterTimeLine();

    time_curr.innerHTML = `${cMinutes}:${cSeconds}`;
    if (time_curr.innerHTML == time_end.innerHTML) {
        clearInterval(idInterval);
    }
}

function counterTimeLine() {
    time_line.value = Math.floor(player_mp3.currentTime);
    let min = time_line.min,
        max = time_line.max,
        val = time_line.value;
    time_line.style.backgroundSize = ((val - min) * 100) / (max - min) + "% 100%";
}

function startSpecific(val) {
    player_mp3.currentTime = val;
    idInterval = setInterval(() => startCounter(), 1000);
}

function updateVolume(val) {
    player_mp3.volume = val / 100;
    volume_slider.style.backgroundSize = `${val}% 100%`;
    volume_slider.value = val;
    volume_btn.className = val == 0 ? "muted" : "not-muted";
}

function next(songs) {
    for (let i = 0; i < songs.length; i++) {
        if (songs[i].id == "pause-this" && i != songs.length - 1) {
            play(songs[i + 1]);
            break;
        }
    }
}

function previous(songs) {
    for (let i = 0; i < songs.length; i++) {
        if (songs[i].id == "pause-this" && i != 0) {
            play(songs[i - 1]);
            break;
        }
    }
}

function shuffle(songs) {
    shuffle_btn.style.color = "var(--special-Color)";
    let val = Math.floor(Math.random() * songs.length);
    startAudio(songs[val]);
}

function activeLoopAudio() {
    player_mp3.toggleAttribute("loop");
    loop_btn.style.color = player_mp3.hasAttribute("loop") ?
        "var(--special-Color)" :
        "var(--text-Color)";
}