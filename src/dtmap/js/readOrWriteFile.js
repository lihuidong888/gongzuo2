// 文件系统模块执行文件操作(写入文件)
// const fs = require('fs');
// json数据
// var jsonData = '{"persons":[{"name":"John","city":"New York"},{"name":"Phil","city":"Ohio"}]}';
// 解析json
// var jsonObj = JSON.parse(jsonData);
// console.log(jsonObj);
// 字符串化JSON对象
// var jsonContent = JSON.stringify(jsonObj);
// console.log(jsonContent);
// fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
//   if (err) {
//     console.log("An error occured while writing JSON Object to File.");
//     return console.log(err);
//   }
//   console.log("JSON file has been saved.");
// });

function init2() {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    // 获取目录下所有文件，对于该浏览器缓存目录，仅能获取到一个文件
    // var path = 'C:\\Users\\zhang\\AppData\\Local\\Microsoft\\Windows\\Temporary Internet Files';
    var path = 'C:\\Users\\Administrator\\Desktop\\我的项目\\DTVueDemo\\src\\dtmap\\data\\testdata';
    //path = 'F:\\test';
    var fldr = fso.GetFolder(path);
    var ff = new Enumerator(fldr.Files);
    // var s = '';
    var fileArray = new Array();
    var fileName = '';
    var count = 0;
    for (; !ff.atEnd(); ff.moveNext()) {
        fileName = ff.item().Name + '';
        fileName = fileName.toLowerCase();
        fileName = fileName.substring(0, fileName.indexOf('.'));
        fileName = fileName.substring(fileName.lastIndexOf('@') + 1);
        // s += fileName + '\n';
        fileArray.push(fileName);
        count++;
    }
    return fileName;
    // alert(count + ',' + s);
}
init2();
