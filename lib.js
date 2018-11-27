var fs=require('fs');
var path=require('path');
var async=require('./node_modules/async');

var checkFile = function (dirname, suffix, cb) {
    var mainShuzu = [];
    fs.readdir(dirname,function (err,file) {
        async .map(file, function (file, done) {
            var fileFullPath  = path.join(dirname, file);
            if(fs.statSync(fileFullPath).isDirectory()){
                checkFile(fileFullPath, suffix, function (err, subShuzu) {
                    mainShuzu = mainShuzu.concat(subShuzu);
                    done();
                });
            } else{
                if(path.extname(fileFullPath) === suffix) {
                    mainShuzu.push(fileFullPath);
                }
                done();
            }
        },function (err) {
            cb(err, mainShuzu);
        });
    })
};

var removeSpace = function (str) {
    var newStr = '';
    for(var i=0,l=str.length; i<l; i++){
        if(str[i] === ' ' || str[i] === '\t' || str[i] === '\r'){
            continue;
        }
        newStr += str[i];
    }
    return newStr;
};

var inspect = function (fileFullPath) {
    var data = fs.readFileSync(fileFullPath, "utf8");
    try{
        //require(fileFullPath);
        JSON.parse(data);
        return {code:0, data:fileFullPath};
    } catch (e) {
        //console.log('%s', e.message);
        //console.log('%s', e.message.indexOf('position'));
        //console.log('%s', e.message.substring(e.message.indexOf('position') + 9));
        var eIdx = Number(e.message.substring(e.message.indexOf('position') + 9));
        var spData = data.substring(0, eIdx).split('\n');
        var rowIdx = -1;
        for(var i=spData.length - 1; i>=0; i--){
            var rmStr = removeSpace(spData[i]);
            if(rmStr.length !== 0){
                rowIdx = i;
                break;
            }
        }
        var row = rowIdx + 1;
        var partStr = removeSpace(spData[rowIdx] || '');
        //console.log('eIdx: %d', eIdx);
        e.message += '\n错误行数：' + row + '\n错误信息：' + partStr;
        return  {code:1, data:e};
    }
};

module.exports.checkFile = checkFile;
module.exports.inspect = inspect;