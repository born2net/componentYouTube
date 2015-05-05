var gulp = require('gulp');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var Rsync = require('rsync');
var fs = require('fs');
var server;

/**
 Configuration
 media.setSrc('https://www.youtube.com/watch?v=i9MHigUZKEM');
 http://signage.me/components/youtube/hosted/main/youtubeload.html
 http://signage.me/components/youtube/youtube.json
 http://www.digitalsignage.com/tmp/youtube2/demo/mediaelementplayer-youtube.html?id=IGQBtbKSVhY
 http://www.digitalsignage.com/tmp/youtube2/demo/mediaelementplayer-youtube.html?id=CzW_5x1M4Uc
 **/
var configFile = 'youtube.json';
var appName = 'youtube';
var zipName = 'youtube.zip';
var localDir = '/cygdrive/c/msweb/componentYouTube/';
var remoteDir = '/var/www/sites/signage.me/htdocs/components/youtube';
var studioDir = 'SignageStudio.86EE3EEE54D7DB049D16E358CDC443F088917621.1';
var studioDirCyg = '/cygdrive/c/Users/Sean/AppData/Roaming/' + studioDir;
var studioDirWin = 'C:/Users/Sean/AppData/Roaming/' + studioDir;


gulp.task('release', function (done) {
    runSequence('debugOff', 'changeVersion', 'zip', 'rsync', 'debugOn', done);
});


gulp.task('watchFile', function () {
    gulp.watch(['./*.html','./js/*','./css/*'], ['cpLocalStudio']);
});


gulp.task('cpLocalStudio', function () {
    var d1 = studioDirWin + '/Local Store/Html/' + appName;
    var d2 = studioDirWin + '/Local Store/Html/' + appName + '/js/';
    var d3 = studioDirWin + '/Local Store/Html/' + appName + '/css/';
    gulp.src('./*.html').pipe(gulp.dest(d1));
    gulp.src('./js/*').pipe(gulp.dest(d2));
    gulp.src('./css/*').pipe(gulp.dest(d3));
});


gulp.task('zip', shell.task([
    'rm ' + zipName,
    'zip -r ' + zipName + ' * -x "*.exe" -x "*.dll" -x "*.bat" -x "*.git" -x "node_modules*" -x "*.zip" -x "*.pak" -x "*.iml" -x "*.dat"'
]));


gulp.task('changeVersion', function () {
    var build = fs.readFileSync('version.log', 'utf8');
    build = parseInt(build);
    build++;
    fs.writeFileSync('version.log', build, 'utf8');
    var doc = fs.readFileSync(configFile, 'utf8');
    var expression = new RegExp(/version": "([0-9]+).([0-9]+).([0-9]+)(.*)",/i);
    var v = doc.match(expression);
    var fullBuild = v[1] + '.' + v[2] + '.' + build;
    console.log(fullBuild);
    var rawVer = v[1] + '.' + v[2] + '.' + build;
    var version = 'version": "' + rawVer + '",';
    doc = doc.replace(/version": "[0-9]+.[0-9]+.[0-9]+",/g, version);
    fs.writeFileSync(configFile, doc, 'utf8');
});


gulp.task('debugOn', function () {
    //setTimeout(function(){
    var doc = fs.readFileSync('package.json', 'utf8');
    doc = doc.replace(/"toolbar": (.*),/g, '"toolbar": true,');
    doc = doc.replace(/"frame": (.*),/g, '"frame": true,');
    doc = doc.replace(/x": -?([0-9])+,/g, 'x": 400,');
    doc = doc.replace(/y": -?([0-9])+,/g, 'y": 400,');
    fs.writeFileSync('package.json', doc, 'utf8');
    console.log('debug is on');
    //},3000);
});


gulp.task('debugOff', function () {
    var doc = fs.readFileSync('package.json', 'utf8');
    doc = doc.replace(/"toolbar": (.*),/g, '"toolbar": false,');
    doc = doc.replace(/"frame": (.*),/g, '"frame": false,');
    doc = doc.replace(/x": -?([0-9])+,/g, 'x": -400,');
    doc = doc.replace(/y": -?([0-9])+,/g, 'y": -400,');
    fs.writeFileSync('package.json', doc, 'utf8');
});


gulp.task('clearStudioCache', shell.task([
    'rm -r -f "' + studioDirCyg + '/Local Store/signage.me"',
    'rm -r -f "' + studioDirCyg + '/Local Store/cachingMap.xml"',
    'rm -r -f "' + studioDirCyg + '/Local Store/signage.me"',
    'rm -r -f "' + studioDirCyg + '/Local Store/download"',
    'rm -r -f "' + studioDirCyg + '/Local Store/Html"'
]));


gulp.task('rsync', function (done) {
    var rsync = Rsync.build({
        source: localDir,
        destination: 'root@mydomain.com:/' + remoteDir,
        exclude: ['*.exe', '*.dll/', '*.git/', '.git/', '*.pak/', '*.iml/', '*.dat/', '*.bat/']
    });
    rsync.set('progress');
    rsync.flags('avz');
    console.log('running the command ' + rsync.command());

    rsync.output(
        function (data) {
            console.log('sync: ' + data);
        }, function (data) {
            console.log('sync: ' + data);
        }
    );
    rsync.execute(function (error, stdout, stderr) {
        console.log('completed ' + error + ' ' + stdout + ' ' + stderr)
        done();
    });
});


/******************************************
 Copy common libs
 ******************************************/
var common = {
    1: {
        s: '/cygdrive/c/msweb/common/utils/',
        d: localDir + '/utils/'
    },
    2: {
        s: '/cygdrive/c/msweb/common/node_modules/',
        d: localDir + '/node_modules/'
    },
    3: {
        s: '/cygdrive/c/msweb/common/bridge/',
        d: localDir + '/bridge/'
    }
};

gulp.task('commonRsync', function (done) {
    for (var i in common) {
        var s = common[i]['s'];
        var d = common[i]['d'];
        console.log('copying files from ' + s + ' to ' + d)
        var rsync = Rsync.build({
            source: s,
            destination: d
        });
        //rsync.delete(); // delete files on destination that do not exist in source
        rsync.set('progress');
        rsync.flags('avz');
        console.log('running the command ' + rsync.command());
        rsync.output(
            function (data) {
                console.log('sync: ' + data);
            }, function (data) {
                console.log('sync: ' + data);
            }
        );
        rsync.execute(function (error, stdout, stderr) {
            console.log('completed ' + error + ' ' + stdout + ' ' + stderr)
            //done();
        });
    }
});


function reload() {
    if (1) {
        return browserSync.reload({
            stream: true
        });
    }
    return gutil.noop();
}


function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}
