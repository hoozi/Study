//简单实现并行化流程控制

var fs = require("fs")
   ,completedTasks = 0
   ,tasks = []
   ,wordCounts = {}
   ,filesDir = './text';

//检测任务是否全部完成
function checkIfComplete(){
    completedTasks++;
    
    //当所有的任务完成后
    if(completedTasks == tasks.length) {
        for(var index in wordCounts) {
            console.log(index + ":" + wordCounts[index])
        }
    }
}

//检测单词在文档中出现的单词计数
function countWordsInText(text) {
    var words = text
               .toString()
               .toLowerCase()
               .split(/\W+/)
               .sort();
    for(var index in words) {
        var word = words[index];
        if(word) {
            wordCounts[word] = (wordCounts[word])?(++wordCounts[word]):1;
        }
    }
}
fs.readdir(filesDir, function(err, files) {
    if(err) throw err;
    for(var index in files) {
        var task = (function(file){
            return function(){
                fs.readFile(file, function(err, text) {
                    if(err) throw err;
                    countWordsInText(text);
                    checkIfComplete();
                })
            }
        })(filesDir+"/"+files[index])
        tasks.push(task);
    }
    
    //运行任务
    for(var task in tasks) {
        tasks[task]();
    }
})