// Swiped from http://stackoverflow.com/questions/9640266/convert-hhmmss-string-to-seconds-only-in-javascript
function hmsToSecondsOnly(str) {
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

function revealSlide(e) {
    var element = e.target;

    if(element.paused || element.ended) return;

    var timepoints = element.getAttribute('data-timepoints');

    if(!timepoints) return;

    var tplist = timepoints.split(',')
    var fragment = tplist.length;

    for(var x=0; x < tplist.length; x++) {
        var transtime = hmsToSecondsOnly(tplist[x]); // Allow (hh:)mm:ss
        
        if(element.currentTime < transtime) {
            fragment = x-1; // Not sure why numbering changed...?
            break;
        }
    }

    var where = Reveal.getIndices();
    console.log(where.f, fragment, element.currentTime, transtime);
    if(where.f != fragment)
        Reveal.navigateFragment(fragment);
}

function hideAudio(ob) {
    var audioelements = document.getElementsByTagName('audio')
    if(!audioelements) return;

    for(var i=0; i<audioelements.length; i++) {
        /* Use dataset since reveal.js uses data-autoplay, not autoplay */
        audioelements[i].style.display = "none";
    }

    /*
    if(!ob)
        ob = document.getElementById('narrationToggle')
    if(!ob)
        return;

    ob.innerHTML = '🔇 Enable Narration';
    */
}


function disableAutoplay(ob) {
    var audioelements = document.getElementsByTagName('audio')
    if(!audioelements) return;

    for(var i=0; i<audioelements.length; i++) {
        /* Use dataset since reveal.js uses data-autoplay, not autoplay */
        delete audioelements[i].dataset.autoplay;
        audioelements[i].style.display = "none";
    }
    
    if(!ob)
        ob = document.getElementById('narrationToggle')
    if(!ob)
        return;

    ob.innerHTML = '🔇 Enable Narration';
}

function enableAutoplay(ob) {
    var audioelements = document.getElementsByTagName('audio')
    if(!audioelements) return;

    for(var i=0; i<audioelements.length; i++) {
        /* Use dataset since reveal.js uses data-autoplay, not autoplay */
        audioelements[i].dataset.autoplay = "autoplay";
        audioelements[i].style.display = "block";
    }

    if(!ob)
        ob = document.getElementById('narrationToggle')
    if(!ob)
        return;
    
    ob.innerHTML = '🔊 Disable Narration';
}

function autoplayOn() {
    var audioelements = document.getElementsByTagName('audio')
    if(!audioelements) return false;

    /* Assume they're all in the same state for simplicity's sake... */
    return ('autoplay' in audioelements[0].dataset);
}

function toggleAutoplay(ob) {
    var enabled = autoplayOn();

    if(enabled)
        disableAutoplay(ob);
    else
        enableAutoplay(ob);
}

Reveal.addEventListener( 'ready', function( event ) {
    // event.currentSlide, event.indexh, event.indexv
    var audioelements = document.getElementsByTagName('audio')
    var androidRe = /Android/g
    var chromeRe = /Chrome\/([1-9]|[12][0-9]|3[012])\./g
    
    var isOldChrome = (androidRe.test(navigator.userAgent) &&
                       chromeRe.test(navigator.userAgent))

    for(var i=0; i<audioelements.length; i++) {
        // Add our event trigger to each audio element
        audioelements[i].addEventListener('timeupdate', revealSlide, false);

        // Hack to remove the ogg/opus elements for Android Chrome
        // only do this in Chrome versions <= 32
        var opusRe = /audio\/ogg; codecs=opus/g

        if(isOldChrome) {
            var alts = audioelements[i].getElementsByTagName('source')
            for(var j=0; j<alts.length; j++) {
                if(opusRe.test(alts[j].type)) {
                    audioelements[i].removeChild(alts[j]);
                    j--;
                }
            }
        }
    }
} );

// Disable autoplay in overview mode; reenable when exiting if was on already
var initialAutoplayState;
Reveal.addEventListener('overviewshown', function(event) {
    initialAutoplayState = autoplayOn();
    disableAutoplay();
    var audio = event.currentSlide.getElementsByTagName('audio');
    if(audio[0])
        audio[0].pause();
}, false );

Reveal.addEventListener('overviewhidden', function(event) {
    if(initialAutoplayState) {
        enableAutoplay();
        var audio = event.currentSlide.getElementsByTagName('audio');
        if(audio[0])
            audio[0].play();
    }
}, false);
