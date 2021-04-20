<template>
    <div class="getColorWrap" ref="container">
        <canvas id="canvas" width="240" height="240"></canvas>
        <div class="pointStle" ref="point" id="point"></div>
    </div>
</template>

<script>
export default {
    name: "colorSelect",
    data() {
        return {
            colorNum: "#007DFF",
        };
    },
    created() {},
    mounted() {
        this.$nextTick(() => {
            this.drawGradient();
            this.dragTouchstart();
        });
    },
    methods: {
        //绘图
        drawGradient() {
            var iSectors = 360;
            var iSectorAngle = (360 / iSectors / 180) * Math.PI;
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            //清除画布内容
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //存储当前环境
            ctx.save();
            //画布（0,0）初始点映射到中间圆点
            ctx.translate(canvas.width / 2, canvas.height / 2);
            for (let i = 0; i < 360; i++) {
                var startAngle = 0;
                var endAngle = startAngle + iSectorAngle;
                var radius = canvas.width / 2 - 1;
                //iSectorAngle * i  变量弧度的计算
                var grd = ctx.createLinearGradient(
                    0,
                    0,
                    canvas.width / 4,
                    canvas.height / 4
                );
                grd.addColorStop(0, `hsl(${i},0%,100%)`);
                grd.addColorStop(1, `hsl(${i},100%,50%)`);
                /*  hue - 色相	定义色相 (0 到 360) - 0 (或 360) 为红色, 120 为绿色, 240 为蓝色
                    saturation - 饱和度	定义饱和度; 0% 为灰色， 100% 全色
                    lightness - 亮度	定义亮度 0% 为暗, 50% 为普通, 100% 为白
                    alpha - 透明度	定义透明度 0（透完全明） ~ 1（完全不透明）
                */
                ctx.beginPath();
                ctx.moveTo(0, 0);
                //False = 顺时针，true = 逆时针
                ctx.arc(0, 0, radius, startAngle, endAngle, false);
                ctx.closePath();
                //设置或返回用于笔触的颜色、渐变或模式。（边）
                ctx.strokeStyle = grd;
                //绘制已定义的路径。
                ctx.stroke();
                //设置或返回用于填充绘画的颜色、渐变或模式。（内容）
                ctx.fillStyle = grd;
                //填充当前绘图（路径）。
                ctx.fill();
                //都是在同一地方绘出的点，需要通过旋转来调整位置。
                //重复360，调整360
                ctx.rotate(-iSectorAngle);
            }
            //返回之前保存过的路径状态和属性。
            ctx.restore();
        },
        //色板点击事件
        dragTouchstart() {
            var _this = this;
            var canvas = document.getElementById("canvas");
            var point = document.getElementById("point");
            var pointOffset = document.querySelector(".pointStle");
            var width = canvas.width;
            //canvas本身点击监听
            canvas.addEventListener("click", function (e) {
                let ePos = {
                    x: e.offsetX || e.layerX,
                    y: e.offsetY || e.layerY,
                };
                _this.limitArea(ePos, width);
            });
            //圆圈本身移动监听
            point.addEventListener("touchmove", function (e) {
                let movePos = {
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY,
                };
                let arr = _this.getOffset();
                let pointPos = {
                    x: movePos.x - arr[0],
                    y: movePos.y - arr[1],
                };
                _this.limitArea(pointPos, width);
            });
            //点击canvas移动事件
            canvas.addEventListener("touchmove", function (e) {
                let movePos = {
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY,
                };
                let arr = _this.getOffset();
                let pointPos = {
                    x: movePos.x - arr[0],
                    y: movePos.y - arr[1],
                };
                _this.limitArea(pointPos, width);
            });
        },
        //获取rgba颜色
        getRgbaAtPoint(pos) {
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imgData.data;
            //getImageData数组的数量是canvas的宽度 * 高度 * 4 ，因为图片是rgba颜色组成的
            //因为有rgba四个数值所以要对应*4，要获取四个数值对应一个点
            //比如原先是x(1)对应一个y(1234)数组，但现在y数组对应一个点需要有对应4个参数(rgba),所以y就变成了(1234....16)
            //现在x从y数组里需要获取到一个点，就需要*4，因为y数组4个参数代表一个点。
            // 索引值获取方式：纵坐标*图像宽度+横坐标 canvas的颜色点从(0,0)到（240,240）采用线性分布的方式
            var dataIndex = (pos.y * imgData.width + pos.x) * 4;
            var colorArr = [
                data[dataIndex],
                data[dataIndex + 1],
                data[dataIndex + 2],
                (data[dataIndex + 3] / 255).toFixed(2),
            ];
            return colorArr;
        },
        //RGB16进制
        showRGB(str) {
            var hexcode = "#";
            for (var i = 0; i < 3; i++) {
                if (str[i] < 16) {
                    str[i] = "0" + str[i].toString(16);
                } else {
                    str[i] = str[i].toString(16);
                }
                hexcode += str[i];
            }
            return hexcode.toUpperCase();
        },
        //范围限定与颜色渲染
        limitArea(posValue, widthValue) {
            posValue.x = parseInt(posValue.x);
            posValue.y = parseInt(posValue.y);
            let x = posValue.x - widthValue / 2;
            let y = posValue.y - widthValue / 2;
            let r = widthValue / 2 - 1;
            if (x * x + y * y < r * r) {
                var rgbaStr = this.getRgbaAtPoint(posValue);
                var colorStr = "rgba(" + rgbaStr + ")";
                //显示背景色
                this.$refs.point.style.left = posValue.x + "px";
                this.$refs.point.style.top = posValue.y + "px";
                this.$refs.point.style.backgroundColor = colorStr;
                this.$refs.point.style.boxShadow =
                    "0px 0.1388rem 0.1388rem rgb (0 0 0 / 20%)";
                this.$refs.point.style.border = "2px solid #fff";
                this.colorNum = this.showRGB(rgbaStr);
                //传值rgba
                this.$emit("getColorStr", this.colorNum);
                this.$emit("getColorRgba", colorStr);
            } else {
                console.log("触点不在范围内!");
            }
        },
        getOffset() {
            let conName = document.querySelector(".getColorWrap");
            let conTop = this.$refs.container.offsetTop;
            let conLeft = this.$refs.container.offsetLeft;
            let conObj = conName.offsetParent;
            while (conObj != null) {
                conTop += conObj.offsetTop;
                conLeft += conObj.offsetLeft;
                conObj = conObj.offsetParent;
            }
            let realNum = [conLeft, conTop];
            return realNum;
        },
    },
};
</script>

<style scoped>
.getColorWrap {
    position: relative;
    width: 240px;
    height: 240px;
}
canvas {
    cursor: crosshair;
}
.pointStle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    box-shadow: 0px 0.1388rem 0.1388rem rgb (0 0 0 / 20%);
    border: 2px solid #fff;
    background-color: #ffffff;
}
</style>
