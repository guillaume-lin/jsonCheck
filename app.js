var fs=require('fs');
var checkFile=require('./lib').checkFile;
var inspect=require('./lib').inspect;
var sd = require('silly-datetime');
var async = require('async');
var path = require('path');

var suffix = '.json';
var dir1 = path.resolve(__dirname + '/json');
var dir2 = '';
if(typeof process.argv[2] === 'string'){
    dir2 = process.argv[2]
}

/*var timer = setInterval(function(){
	console.log('\n检查中...\n');
}, 100);*/
console.log('\n提取检查目录文件\n%s\n%s\n', dir1, dir2);

var expDir = path.resolve(__dirname);
var shuzu = [];
async.series([function(cb){
	checkFile(dir1, suffix, function (err, shuzu1) {
		shuzu = shuzu.concat(shuzu1);
		cb(null);
	});
}, function(cb){
	checkFile(dir2, suffix, function (err, shuzu2) {
		for(var i=0,l=shuzu2.length; i<l; i++){
			if(-1 !== shuzu2[i].indexOf(expDir)){
				continue;
			}
            shuzu.push(shuzu2[i]);
		}
		cb(null);
	});
}], function(err, res){
	var time=sd.format(new Date(), 'YYYYMMDD_HHmmss');
    var timeTxt=sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
	console.log('\n开始检查\n');
	console.log('\n总共待检查数量：%d\n', shuzu.length);
	async.mapSeries(shuzu, function(fullpath, done){
		var result = inspect(fullpath);
        if(result.code === 0){
            //console.log('%j ok!', fullpath);
            fs.appendFileSync(__dirname+'/log/'+time+'.txt', timeTxt + ' [info] ' + fullpath + ' OK!' + '\n');
        } else {
            console.log('\n********发现错误********\n%s \nerror: %s\n', fullpath, result.data.message);
            fs.appendFileSync(__dirname+'/log/'+time+'.txt', timeTxt + ' [warn] ' + fullpath + ' ' + result.data.message + '\n');
        }
		done(null);
	}, function(err){
		//clearInterval(timer);
		console.log('\n检查完毕!!!\n');
	});
});