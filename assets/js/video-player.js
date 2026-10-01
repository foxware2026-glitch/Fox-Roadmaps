// ============================================================
// FOX ROADMAPS — YOUTUBE VIDEO PLAYER
// ============================================================

let ytPlayer = null;
let currentActiveTrack = null;
let playbackCheckInterval = null;


// ============================================================
// READ VIDEO INFORMATION FROM URL
// ============================================================

function getVideoFromURL() {

    const urlParams =
        new URLSearchParams(window.location.search);

    const videoId =
        urlParams.get("video");

    const start =
        parseInt(urlParams.get("start"), 10);

    const end =
        parseInt(urlParams.get("end"), 10);

    const title =
        urlParams.get("title");


    return {

        videoId:
            videoId || "hcMzwK90D6c",

        startTime:
            !isNaN(start)
                ? start
                : 0,

        endTime:
            !isNaN(end)
                ? end
                : 99999,

        title:
            title || "How Fox Roadmaps Works"

    };

}


// ============================================================
// INITIALIZE VIDEO INFORMATION
// ============================================================

function setupVideoInformation() {

    currentActiveTrack =
        getVideoFromURL();


    const titleHeader =
        document.getElementById("video-title");


    if (titleHeader) {

        titleHeader.textContent =
            currentActiveTrack.title;

    }


    console.log(
        "Fox Roadmaps video:",
        currentActiveTrack
    );

}


// ============================================================
// YOUTUBE IFRAME API CALLBACK
// ============================================================

window.onYouTubeIframeAPIReady = function () {

    console.log(
        "YouTube IFrame API is ready."
    );


    setupVideoInformation();


    const playerElement =
        document.getElementById("player");


    if (!playerElement) {

        console.error(
            "Fox Roadmaps: #player element was not found."
        );

        return;

    }


    ytPlayer =
        new YT.Player("player", {

            width: "100%",

            height: "100%",

            videoId:
                currentActiveTrack.videoId,


            playerVars: {

                // Keep YouTube's native controls visible
                controls: 1,

                // Automatically start the lesson
                autoplay: 1,

                // Reduce unrelated recommendations
                rel: 0,

                // Smaller YouTube branding where supported
                modestbranding: 1,

                // Initial lesson boundaries
                start:
                    currentActiveTrack.startTime,

                end:
                    currentActiveTrack.endTime,

                // Helps YouTube validate embedded player execution
                origin:
                    window.location.origin

            },


            events: {

                onReady:
                    onPlayerReady,

                onStateChange:
                    onPlayerStateChange,

                onError:
                    onPlayerError

            }

        });

};


// ============================================================
// PLAYER READY
// ============================================================

function onPlayerReady(event) {

    console.log(
        "Fox Roadmaps YouTube player is ready."
    );


    // --------------------------------------------------------
    // Start exactly at the requested lesson timestamp
    // --------------------------------------------------------

    if (
        currentActiveTrack &&
        currentActiveTrack.startTime > 0
    ) {

        event.target.seekTo(
            currentActiveTrack.startTime,
            true
        );

    }


    // --------------------------------------------------------
    // Autoplay
    // Browsers generally require autoplay to be muted.
    // --------------------------------------------------------

    event.target.mute();

    event.target.playVideo();


    // --------------------------------------------------------
    // Start lesson boundary protection.
    //
    // This continues running even when the video is paused,
    // allowing us to control manual timeline seeking.
    // --------------------------------------------------------

    startBoundaryClockWatch();


    // --------------------------------------------------------
    // Unmute after first user interaction
    // --------------------------------------------------------

    const unmuteOnInteraction = () => {

        if (
            ytPlayer &&
            typeof ytPlayer.unMute === "function"
        ) {

            ytPlayer.unMute();

            console.log(
                "Browser interaction verified. Audio unmuted."
            );


            document.removeEventListener(
                "click",
                unmuteOnInteraction
            );


            document.removeEventListener(
                "touchstart",
                unmuteOnInteraction
            );

        }

    };


    document.addEventListener(
        "click",
        unmuteOnInteraction
    );


    document.addEventListener(
        "touchstart",
        unmuteOnInteraction
    );

}


// ============================================================
// PLAYER STATE CHANGE
// ============================================================

function onPlayerStateChange(event) {

    // --------------------------------------------------------
    // VIDEO PLAYING
    // --------------------------------------------------------

    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        console.log(
            "Video playing."
        );

        return;

    }


    // --------------------------------------------------------
    // VIDEO PAUSED
    // --------------------------------------------------------

    if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        console.log(
            "Video paused."
        );

        return;

    }


    // --------------------------------------------------------
    // VIDEO ENDED
    // --------------------------------------------------------
    //
    // If YouTube itself reports that the video has ended,
    // return the player to the beginning of the Fox Roadmaps
    // lesson segment.
    //
    // This makes the YouTube Replay button replay the lesson
    // segment rather than the entire YouTube video.
    // --------------------------------------------------------

    if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        console.log(
            "Video ended. Resetting to Fox Roadmaps lesson start."
        );


        if (
            ytPlayer &&
            currentActiveTrack
        ) {

            ytPlayer.seekTo(
                currentActiveTrack.startTime,
                true
            );

        }

    }

}


// ============================================================
// WATCH LESSON BOUNDARIES
// ============================================================
//
// Continuously checks the current playback position.
//
// The watcher runs while the video is playing AND while it is
// paused. This means the learner cannot pause the video and
// drag the timeline outside the Fox Roadmaps lesson range.
// ============================================================

function startBoundaryClockWatch() {

    stopBoundaryClockWatch();


    playbackCheckInterval =
        setInterval(function () {

            if (
                !ytPlayer ||
                typeof ytPlayer.getCurrentTime !== "function" ||
                !currentActiveTrack
            ) {

                return;

            }


            const currentTime =
                ytPlayer.getCurrentTime();


            const startTime =
                currentActiveTrack.startTime;


            const endTime =
                currentActiveTrack.endTime;


            // =================================================
            // USER SEEKS BEFORE LESSON START
            // =================================================

            if (
                currentTime <
                startTime
            ) {

                console.log(
                    "Fox Roadmaps: User moved before lesson start. Returning to lesson start."
                );


                ytPlayer.seekTo(
                    startTime,
                    true
                );


                return;

            }


            // =================================================
            // LESSON END REACHED
            // =================================================
            //
            // When the reader reaches the end of the selected
            // lesson segment:
            //
            // 1. Pause the video.
            // 2. Reset the player to the lesson START.
            //
            // This means clicking Replay/Play starts the lesson
            // again from the correct Fox Roadmaps timestamp.
            // =================================================

            if (
                currentTime >=
                endTime
            ) {

                console.log(
                    "Fox Roadmaps: Lesson end reached. Resetting to lesson start."
                );


                ytPlayer.pauseVideo();


                ytPlayer.seekTo(
                    startTime,
                    true
                );


                return;

            }

        }, 200);

}


// ============================================================
// STOP TIMESTAMP WATCH
// ============================================================

function stopBoundaryClockWatch() {

    if (playbackCheckInterval) {

        clearInterval(
            playbackCheckInterval
        );

        playbackCheckInterval = null;

    }

}


// ============================================================
// YOUTUBE ERROR HANDLER
// ============================================================

function onPlayerError(event) {

    console.error(
        "YouTube Player Error:",
        event.data
    );


    switch (event.data) {

        case 2:

            console.error(
                "Invalid YouTube video ID or parameters."
            );

            break;


        case 5:

            console.error(
                "The requested content cannot be played in the HTML5 player."
            );

            break;


        case 100:

            console.error(
                "This video was not found or has been removed."
            );

            break;


        case 101:

        case 150:

            console.error(
                "This video does not allow embedding."
            );

            break;


        default:

            console.error(
                "Unknown YouTube player error."
            );

    }

}