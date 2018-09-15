1. 随机或者根据信息素表（在禁忌表的限制下）决定是否位移或者位移到哪

2. 上下料

  1. 有可能是1357上下料 
  2. 有可能是2468上下料

3. 手空无需清洗下轮只能去1，手上半成品无需清洗下轮只能去2，手上成品需要清洗下轮还是只能去1

  1. 如果之前是第**给第一道**工序cnc上下料，那么现在就不用清洗，准备进入下一次循环，

    1. 如果这个cnc**是处**，下一次可以去任意空闲的第一道工序cnc**（做完手上是空的）**
    2. 如果这个cnc**不是处**，下一次只能空闲的去第二道工序cnc（如果没有空闲的第二道工序cnc，就等到有为止）**（做完手上有半成品）**

  2. 如果之前**给第二道**工序cnc上下料，

    1. 但是这个第二道工序cnc**是处**，那么也不需要清洗，
      然后再进入下一次循环，下一次可以去任意空闲的第一道工序cnc**（做完手上是空的）**

    2. 并且这个第二道工序cnc**不是处**，那么需要清洗
      然后再进入下一次循环，下一次可以去任意空闲的第一道工序cnc**（做完手上有成品）**



      ![image-20180916005042787](/var/folders/kt/j8yh28xd5sj5tpqj8zdz37500000gn/T/abnerworks.Typora/image-20180916005042787.png)



      ![image-20180916005004669](/var/folders/kt/j8yh28xd5sj5tpqj8zdz37500000gn/T/abnerworks.Typora/image-20180916005004669.png)



![image-20180916004952633](/var/folders/kt/j8yh28xd5sj5tpqj8zdz37500000gn/T/abnerworks.Typora/image-20180916004952633.png)

![image-20180916005545335](/var/folders/kt/j8yh28xd5sj5tpqj8zdz37500000gn/T/abnerworks.Typora/image-20180916010518025.png)



![image-20180916010455882](/var/folders/kt/j8yh28xd5sj5tpqj8zdz37500000gn/T/abnerworks.Typora/image-20180916010555955.png)