$(function () {
    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
        alert("Error occured: " + errorMsg);
        return false;
    };


    /*
    var _mostPopular = function(){
        $.get('https://gdata.youtube.com/feeds/api/standardfeeds/us/most_popular?v=2', function (xml) {
            self.x2js = new X2JS({
                escapeMode: true,
                attributePrefix: "_",
                arrayAccessForm: "none",
                emptyNodeForm: "text",
                enableToStringFunc: true,
                arrayAccessFormPaths: [],
                skipEmptyTextNodesForObj: true
            });
            var x2js = new X2JS();
            var playerData = x2js.xml_str2json(xml.children["0"].outerHTML);
            console.log(playerData);

            _.forEach(playerData.feed.entry, function(k,v){
                console.log(k,v);
            });
        });
    };
    _mostPopular();
    */

    $('video').mediaelementplayer({
        features: [],
        loop: true,
        startVolume: 0.0,
        success: function (media, node, player) {
            //$('#pluginInfo').text('plugin: ' + node.id + '-mode' +  media.pluginType);

            // tried to invoke an auto start in Android, no luck, video plays black
            setTimeout(function () {
                // $('.mejs-overlay-button').trigger('click');
                media.setSrc('https://www.youtube.com/watch?v=IGQBtbKSVhY');
                media.load();
                media.play();
                // $('video').load();
                // $('video').attr('autoplay', 'true');

            }, 6000);

            // var videoID = 'BQ4yd2W50No';
            videoID = location.search.split('id=')[1];
            //$('#videoID').text('Video id: ' + videoID);
            media.setSrc('https://www.youtube.com/watch?v=' + videoID);
            media.load();
            media.play();

            /*
             if (media.pluginType == 'flash') {
             media.addEventListener('canplay', function () {
             media.play();
             }, false);
             }
             */

            media.addEventListener('ended', function (e) {
                //$('#ended').text('loop: ' + ++loop);
            }, false);
        }
    });
});
