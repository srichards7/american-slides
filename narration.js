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
    Reveal.slide(where.h, where.v, fragment);
}

var audioelements = document.getElementsByTagName('audio')

for(var i=0; i<audioelements.length; i++) {
    // Hack to remove the ogg/opus elements for Android Chrome
    // only do this in Chrome versions <= 32
    var alts = audioelements[i].getElementsByTagName('source')
    var androidRe = /Android/g
    var chromeRe = /Chrome\/([1-9]|[12][0-9]|3[012])\./g
    var opusRe = /audio\/ogg; codecs=opus/g

    if(androidRe.test(navigator.userAgent) &&
       chromeRe.test(navigator.userAgent)) {
        for(var j=0; j<alts.length; j++) {
            if(opusRe.test(alts[j].type)) {
                audioelements[i].removeChild(alts[j]);
                j--;
            }
        }
    }

    // Add our event trigger to each audio element
    audioelements[i].addEventListener('timeupdate', revealSlide, false);
}
