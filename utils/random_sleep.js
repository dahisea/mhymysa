async function randomSleep(min, max) {
    return new Promise((resolve) => setTimeout(resolve, randomNum(min, max) * 1000))
}

function randomNum(minNum, maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10)
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
        default: 
            return 0
    } 
}

export default randomSleep