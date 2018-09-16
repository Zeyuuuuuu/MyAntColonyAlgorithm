// Define the `phonecatApp` module
var acaApp = angular.module('acaApp', []);

// Define the `PhoneListController` controller on the `phonecatApp` module
acaApp.controller('acaCtrl', function PhoneListController($scope) {
    var task = []
    /** 迭代次数 */

    $scope.taskNum = 100;
    $scope.nodeNum = 8;
    $scope.iteratorNum = 10;
    $scope.antNum = 10;

    $scope.t = [20, 33, 46, 28, 31, 25]

    /** 任务处理时间矩阵(记录单个任务在不同节点上的处理时间) */
    var moveTime = [];
    var operateTime = [];

    //究竟是第一道工序还是第二道呢
    $scope.cncProcess = [1, 2, 1, 2, 1, 2, 1, 2];
    //手上状态 0为空，1为半成品，2为成品
    var handState = 0;

    //cnc倒计时
    var cncTimer = [0, 0, 0, 0, 0, 0, 0, 0];
    var cncFirst = [true, true, true, true, true, true, true, true]
    //处理时间
    $scope.cncTime = 560;
    $scope.cncTime2 = [400, 378]

    /** 信息素矩阵(记录每条路径上当前信息素含量，初始状态下均为0) */
    var pheromoneMatrix = [];

    /** 最大信息素的下标矩阵(存储当前信息素矩阵中每行最大信息素的下标) */
    var maxPheromoneMatrix = [];

    /** 一次迭代中，随机分配的蚂蚁临界编号(该临界点之前的蚂蚁采用最大信息素下标，而该临界点之后的蚂蚁采用随机分配) */
    var criticalPointMatrix = [];

    /** 任务处理时间结果集([迭代次数][蚂蚁编号]) */
    var resultData = [];

    /** 每次迭代信息素衰减的比例 */
    $scope.p = 0.5;

    /** 每次经过，信息素增加的比例 */
    $scope.q = 2;

    $scope.ALPHA = 1;
    $scope.BETA = 5;
    var ROU = 0.5;


    /**
     * 蚁群算法
     */

    function aca() {
        // 初始化任务执行时间矩阵

        // taskNum = parseInt(document.getElementById('taskNum').value);
        // nodeNum = parseInt(document.getElementById('nodeNum').value);
        // iteratorNum = parseInt(document.getElementById('iteratorNum').value);
        // antNum = parseInt(document.getElementById('antNum').value);
        // cncTime = parseInt(document.getElementById('cncTime').value);
        // cncTime2[0] = parseInt(document.getElementById('cncTime2_1').value);
        // cncTime2[1] = parseInt(document.getElementById('cncTime2_2').value);
        // cncProcess[0] = parseInt(document.getElementById('cnc1').value);
        // cncProcess[1] = parseInt(document.getElementById('cnc2').value);
        // cncProcess[2] = parseInt(document.getElementById('cnc3').value);
        // cncProcess[3] = parseInt(document.getElementById('cnc4').value);
        // cncProcess[4] = parseInt(document.getElementById('cnc5').value);
        // cncProcess[5] = parseInt(document.getElementById('cnc6').value);
        // cncProcess[6] = parseInt(document.getElementById('cnc7').value);
        // cncProcess[7] = parseInt(document.getElementById('cnc8').value);
        // t[0] = parseInt(document.getElementById('t0').value);
        // t[1] = parseInt(document.getElementById('t1').value);
        // t[2] = parseInt(document.getElementById('t2').value);
        // t[3] = parseInt(document.getElementById('t3').value);
        // t[4] = parseInt(document.getElementById('t4').value);
        // t[5] = parseInt(document.getElementById('t5').value);


        initTime();

        // 初始化信息素矩阵
        pheromoneMatrix = initM(taskNum, nodeNum, 1);
        // for (var i = 0; i < nodeNum; i++)
        //     for (var j = 0; j < nodeNum; j++)
        //         if (i === j)
        //             pheromoneMatrix[i][j] = 0;

        //updateCriticalPoint();
        // 迭代搜索
        antSearch(iteratorNum, antNum);

    }

    function updateCriticalPoint() {
        criticalPointMatrix = [];
        for (var taskIndex = 0; taskIndex < taskNum; taskIndex++) {
            var maxPheromone = pheromoneMatrix[taskIndex][0];
            var maxIndex = 0;
            var sumPheromone = pheromoneMatrix[taskIndex][0];
            var isAllSame = true;

            for (var nodeIndex = 1; nodeIndex < nodeNum; nodeIndex++) {
                if (pheromoneMatrix[taskIndex][nodeIndex] > maxPheromone) {
                    maxPheromone = pheromoneMatrix[taskIndex][nodeIndex];
                    maxIndex = nodeIndex;
                }

                if (pheromoneMatrix[taskIndex][nodeIndex] != pheromoneMatrix[taskIndex][nodeIndex - 1]) {
                    isAllSame = false;
                }

                sumPheromone += pheromoneMatrix[taskIndex][nodeIndex];
            }

            // 若本行信息素全都相等，则随机选择一个作为最大信息素
            if (isAllSame == true) {
                maxIndex = random(0, nodeNum - 1, true);
                maxPheromone = pheromoneMatrix[taskIndex][maxIndex];
            }


            // 将本次迭代的蚂蚁临界编号加入criticalPointMatrix(该临界点之前的蚂蚁的任务分配根据最大信息素原则，而该临界点之后的蚂蚁采用随机分配策略)
            criticalPointMatrix.push(Math.round(antNum * (maxPheromone / sumPheromone)));
        }
    }

    function initTime() {
        moveTime = initM(5, 5, 0)
        for (var i = 1; i < 5; i++) {
            for (var j = 1; j < 5; j++) {
                if (-1 === i - j || 1 === i - j) {
                    moveTime[i][j] = t[0]
                } else if (-2 === i - j || 2 === i - j) {
                    moveTime[i][j] = t[1]
                } else if (-3 === i - j || 3 === i - j) {
                    moveTime[i][j] = t[2]
                }
            }
        }
        // console.log(moveTime)

        operateTime[0] = t[4]; //s2,4,6,8
        operateTime[1] = t[3]; //s1,3,5,7
        operateTime[2] = t[5]; //clean
    }



    /**
     * 初始化一个二维数组
     * @param n 行数
     * @param m 列数
     * @param defaultNum 默认值
     */
    function initM(n, m, defaultNum) {
        var matrix = [];
        for (var i = 0; i < n; i++) {
            var matrix_i = [];
            for (var j = 0; j < m; j++) {
                matrix_i.push(defaultNum);
            }
            matrix.push(matrix_i);
        }
        return matrix;
    }

    /**
     * 迭代搜索
     * @param iteratorNum 迭代次数
     * @param antNum 蚂蚁数量
     */
    function antSearch(iteratorNum, antNum) {
        for (var itCount = 0; itCount < iteratorNum; itCount++) {
            // 本次迭代中，所有蚂蚁的路径
            var CNCpathMatrix_allAnt = [];
            var GRVpathMatrix_allAnt = [];
            var CNCpathMatrix_oneAnt = [];
            var GRVpathMatrix_oneAnt = [];
            for (var antCount = 0; antCount < antNum; antCount++) {
                var antLocation = 1;
                CNCpathMatrix_oneAnt = [];
                GRVpathMatrix_oneAnt = [];
                cncTimer = [0, 0, 0, 0, 0, 0, 0, 0];
                cncFirst = [true, true, true, true, true, true, true, true]
                handState = 0
                for (var taskCount = 0; taskCount < taskNum; taskCount++) {

                    //只有一道工序
                    if (1 === stage) {

                        // 第taskCount个任务分配给cnc号机
                        var cnc = assignTask(antCount, taskCount, antLocation);
                        CNCpathMatrix_oneAnt.push(cnc);

                        //如果需要移动
                        if (Math.round(cnc / 2) !== antLocation) {
                            var way = [];
                            way.push(antLocation);
                            way.push(Math.round(cnc / 2))
                            GRVpathMatrix_oneAnt.push(way)
                            cncTimerUpdate(moveTime[antLocation][Math.round(cnc / 2)]);
                            antLocation = Math.round(cnc / 2);
                        }

                        //上下料
                        var operate = [0];
                        operate.push((cnc % 2))
                        GRVpathMatrix_oneAnt.push(operate)
                        cncTimerUpdate(operateTime[(cnc % 2)]);
                        cncTimer[cnc - 1] = cncTime;

                        //cnc爆炸
                        if (enableError && cncTime > random(0, cncTime * 100, true)) {
                            cncTimer[cnc - 1] = random(600, 1200, true);
                            cncFirst[cnc - 1] = true;
                            console.log("蚂蚁" + (antCount + 1) + "在做任务" + (taskCount + 1) + "时，" + cnc + "炸了");
                            taskCount--;
                        }
                        if (!cncFirst[cnc - 1]) {
                            //清洗
                            var operate2 = [0]
                            operate2.push(2)
                            GRVpathMatrix_oneAnt.push(operate2)
                            cncTimerUpdate(operateTime[2]);
                        } else {
                            cncFirst[cnc - 1] = false;
                        }
                    }
                    //两道工序
                    else if (2 === stage) {
                        // 第taskCount个任务分配给cnc号机
                        var cnc = assignTask(antCount, taskCount, antLocation);
                        if (cnc === CNCpathMatrix_oneAnt[taskCount - 1])
                            console.log(cnc)
                        CNCpathMatrix_oneAnt.push(cnc);

                        //如果需要移动
                        if (Math.round(cnc / 2) !== antLocation) {
                            var way = [];
                            way.push(antLocation);
                            way.push(Math.round(cnc / 2))
                            GRVpathMatrix_oneAnt.push(way)
                            cncTimerUpdate(moveTime[antLocation][Math.round(cnc / 2)]);
                            antLocation = Math.round(cnc / 2);
                        }
                        //上下料
                        var operate = [0];
                        operate.push((cnc % 2))
                        GRVpathMatrix_oneAnt.push(operate)
                        cncTimerUpdate(operateTime[(cnc % 2)]);
                        cncTimer[cnc - 1] = cncTime2[cncProcess[cnc - 1] - 1];

                        //根据上下料cnc判断手上情况
                        //如果是处 手上肯定是空的(然后就破处了)
                        if (cncFirst[cnc - 1]) {
                            handState = 0;
                            cncFirst[cnc - 1] = false; //记得破处
                        }
                        //如果不是处，且上下料cnc是第一道，那么手上是半成品
                        //如果不是处，且上下料cnc是第二道，那么手上是成品
                        else {
                            handState = cncProcess[cnc - 1];
                        }
                        //cnc爆炸
                        if (enableError && cncTime2[cncProcess[cnc - 1] - 1] > random(0, cncTime2[cncProcess[cnc - 1] - 1] * 100, true)) {
                            cncTimer[cnc - 1] = random(600, 1200, true);
                            cncFirst[cnc - 1] = true;
                            taskCount--;
                            console.log(cnc - 1 + "炸了");

                        }
                        //如果手上有成品 清洗
                        if (2 === handState) {
                            var operate2 = [0]
                            operate2.push(2)
                            GRVpathMatrix_oneAnt.push(operate2)
                            cncTimerUpdate(operateTime[2]);
                            handState = 0; //清洗完两手空空
                        }
                    }
                }
                // 将当前蚂蚁的路径加入pathMatrix_allAnt
                GRVpathMatrix_allAnt.push(GRVpathMatrix_oneAnt);
                CNCpathMatrix_allAnt.push(CNCpathMatrix_oneAnt);
            }

            // 计算 本次迭代中 所有蚂蚁 的任务处理时间
            var timeArray_oneIt = calTime_oneIt(GRVpathMatrix_allAnt);
            // 将本地迭代中 所有蚂蚁的 任务处理时间加入总结果集
            resultData.push(timeArray_oneIt);

            // 更新信息素
            updatePheromoneMatrix(CNCpathMatrix_allAnt, pheromoneMatrix, timeArray_oneIt);
            console.log(CNCpathMatrix_allAnt, GRVpathMatrix_allAnt, pheromoneMatrix, timeArray_oneIt)
            // document.getElementById("text").innerHTML += CNCpathMatrix_allAnt;
        }
    }

    /**
     * 计算一次迭代中，所有蚂蚁的任务处理时间
     * @param pathMatrix_allAnt 所有蚂蚁的路径
     */
    function calTime_oneIt(pathMatrix_allAnt) {
        var time_allAnt = [];
        for (var antIndex = 0; antIndex < pathMatrix_allAnt.length; antIndex++) {
            // 获取第antIndex只蚂蚁的行走路径
            var pathMatrix = pathMatrix_allAnt[antIndex];

            var time = 0;
            for (var pathIndex = 0; pathIndex < pathMatrix.length; pathIndex++) {
                if (0 === pathMatrix[pathIndex][0])
                    time += operateTime[pathMatrix[pathIndex][1]];
                else
                    time += moveTime[pathMatrix[pathIndex][0]][pathMatrix[pathIndex][1]];
            }

            time_allAnt.push(time);
        }
        return time_allAnt;
    }
    //强！
    function assignTask(antCount, taskCount, antLocation) {

        // 若当前蚂蚁编号在临界点之前，则采用最大信息素的分配方式
        if (antCount <= criticalPointMatrix[taskCount]) {
            // console.log(criticalPointMatrix[taskCount]);
            return pheromoneAssign(taskCount, antLocation);
        }

        return randomAssign();

    }

    //随机分配法
    function randomAssign() {

        //检查有没有挂机，没有挂机时间跳转到下一个挂机！
        var noZero = true;
        var min = -1;
        for (var i in cncTimer) {

            //有两道工序时，如果手上有半成品，跳过所有只能做1号工序的傻逼机器（他们挂不挂机 挂机多久都与我无关！）
            //如果空手，跳过2号处
            if (2 === stage &&
                (1 === handState && 1 === cncProcess[i]) ||
                (0 === handState && 2 === cncProcess[i] && cncFirst[i]))
                continue;
            if (0 === cncTimer[i]) {
                noZero = false;
                break;
            } else if (-1 === min || min > cncTimer[i]) {
                min = cncTimer[i];
            }
        }
        if (noZero) {
            cncTimerUpdate(min);
        }
        // 若当前蚂蚁编号在临界点之后，则采用随机分配方式

        //一道工序 随便抽
        if (1 === stage) {
            var next = random(1, nodeNum, true);
            //抽签抽到不挂机的 就重新抽！
            while (0 !== cncTimer[next - 1])
                next = random(1, nodeNum, true)
            // console.log(next
            return next;
        }
        //两道工序，手上空空
        else if (2 === stage && 0 === handState) {
            var next = random(1, nodeNum, true);
            //我抽签抽到你一号我也不要！重新抽！
            while (0 !== cncTimer[next - 1] || (2 === cncProcess[next - 1] && cncFirst[next - 1]))
                next = random(1, nodeNum, true)
            // console.log(next
            return next;
        }
        //两道工序 且手上是半成品
        else if (2 === stage && 1 === handState) {
            var next = random(1, nodeNum, true);
            //我抽签抽到你一号我也不要！重新抽！
            while (0 !== cncTimer[next - 1] || 1 === cncProcess[next - 1])
                next = random(1, nodeNum, true)
            // console.log(next
            return next;
        }
    }

    //核心！！ 信息素分配法
    function pheromoneAssign(taskCount, antLocation) {
        var selectCncProbs = new Array(nodeNum).fill(0)
        var totalProb = 0;
        for (var i = 0; i < nodeNum; i++) {
            //遍历所有cnc
            //如果只有一道工序（且该cnc挂机），
            //或者有两道工序的，我手上有半成品，并且该cnc是"第二道工序的"（且该cnc挂机）
            //或者有两道工序的，我手上是空的，并且该cnc是不是"第二道处"（且该cnc挂机）
            //则该cnc参与轮盘竞争
            if (0 === cncTimer[i] &&
                (1 === stage ||
                    (2 === stage && 1 === handState && 2 === cncProcess[i]) ||
                    (2 === stage && 0 === handState && !(2 === cncProcess[i] && cncFirst[i]))
                )) {
                selectCncProbs[i] = Math.pow(pheromoneMatrix[taskCount][i], ALPHA) * Math.pow((1 / (moveTime[antLocation][Math.round((i + 1) / 2)] + 1)), BETA)
                totalProb += selectCncProbs[i];
            }
        }

        //轮盘
        if (totalProb > 0) {
            tempProb = random(0, totalProb, false)
            for (var i = 0; i < nodeNum; i++) {
                if (0 === cncTimer[i]) {
                    tempProb -= selectCncProbs[i];
                    if (tempProb < 0) {
                        // console.log(i + 1)
                        return i + 1;
                    }
                }
            }
        }
        return randomAssign();
    }

    /**
     * 更新信息素
     * @param pathMatrix_allAnt 本次迭代中所有蚂蚁的行走路径
     * @param pheromoneMatrix 信息素矩阵
     * @param timeArray_oneIt 本次迭代的任务处理时间的结果集
     */
    function updatePheromoneMatrix(pathMatrix_allAnt, pheromoneMatrix, timeArray_oneIt) {


        //所有信息素均衰减p %
        for (var i = 0; i < taskNum; i++) {
            for (var j = 0; j < nodeNum; j++) {
                pheromoneMatrix[i][j] *= p;
            }
        }

        //最小*2
        // 找出任务处理时间最短的蚂蚁编号
        var minTime = Number.MAX_VALUE;
        var minIndex = -1;
        for (var antIndex = 0; antIndex < antNum; antIndex++) {
            if (timeArray_oneIt[antIndex] < minTime) {
                minTime = timeArray_oneIt[antIndex];
                minIndex = antIndex;
            }
        }

        // 将本次迭代中最优路径的信息素增加q%
        for (var taskIndex = 0; taskIndex < taskNum; taskIndex++) {
            pheromoneMatrix[taskIndex][pathMatrix_allAnt[minIndex][taskIndex] - 1] *= q;
        }

        // //蚁环
        // for (var antIndex = 0; antIndex < antNum; antIndex++) {
        //     for (var taskIndex = 0; taskIndex < taskNum; taskIndex++) {
        //         pheromoneMatrix[taskIndex][pathMatrix_allAnt[antIndex][taskIndex] - 1] += q / timeArray_oneIt[antIndex];
        //     }
        // }

        updateCriticalPoint();


    }

    //时间推移
    function cncTimerUpdate(time) {
        for (var cncIndex = 0; cncIndex < nodeNum; cncIndex++) {
            if (time > cncTimer[cncIndex])
                cncTimer[cncIndex] = 0;
            else
                cncTimer[cncIndex] = cncTimer[cncIndex] - time;
        }
    }

    //随机数生成
    var today = new Date();
    var seed = today.getTime();

    function random(min, max, isRound) {
        max = max || 1;
        min = min || 0; // 根据数值进行随机值计算    
        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;
        if (isRound)
            return Math.round(min + rnd * (max - min));
        else
            return (min + rnd * (max - min));

    }

    var stage = 1;

    function changeStage() {
        if (1 === stage)
            stage = 2;
        else if (2 === stage)
            stage = 1;
        document.getElementById('stage').innerHTML = stage;
    }

    var enableError = false;

    function changeErrorState() {
        if (!enableError)
            enableError = true;
        else
            enableError = false;
        document.getElementById('error').innerHTML = enableError;

    }
})

function test() {
    console.log(cncTime2[1])
}