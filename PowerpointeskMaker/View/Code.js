//array of picture elements
var pictureArray = []
//x,y,width,window,path

//array of polygons
var polygonArray = []
//[[arrayOfPoints], wheretoo, opacity, color, window, index]

//The curent window we are on
var curentWindow = 0;

//width of the svg
var BGWIDTH = 1500;

//height of the svg
var BGHEIGHT = 3000;

//loads the csv files into an array, so we can display the windows
function loadData(){
    d3.csv("https://raw.githubusercontent.com/efschwarzrock/PP-D3-Data-Store/master/Pictures.csv", function (data) {
        
        var i = 0
        while(i < data.length){
            pictureArray.push([data[i].X, data[i].Y, data[i].Width, data[i].Window, data[i].Path, i])
            i++;
        }
        
        d3.csv("https://raw.githubusercontent.com/efschwarzrock/PP-D3-Data-Store/master/Polygons.csv", function (data) {
            var i = 0;
            while(i<data.length){
                polygonArray.push([data[i].Points, data[i].WhereTo, data[i].Opacity, data[i].Color, data[i].Window, i]) 
                i++;
            }
            //csv function parrellizes so we need to put load in side it so the data gets loaded befor it runs   
            render() 
        })
    })
}

function update(){
    d3.select("svg").remove();
    render();
}


//updates the screan
function render(){

    
     // append the svg object to the body of the page
     var svg = d3.select("#screen")
     .append("svg")
     .attr("width", BGWIDTH)
     .attr("height", BGHEIGHT)
     .attr("fill", "#00ff00")
     .attr("background", "#00ff00");
     
     svg.append("rect")
     .attr("width", "100%")
     .attr("height", "100%")
     .attr("fill", "brown")
     .on("click", function(d){  editingPic = -1;
                                editingPoly = -1;
                                update()});


    //images
    var imgs = svg.selectAll("image")
        .data(pictureArray.filter(function(d){
            return d[3] == curentWindow
        }))
        .enter()
        .append("svg:image")
        .attr("xlink:href", d => d[4])
        .attr("x", d => d[0])
        .attr("y", d => d[1])
        .attr("width", d => d[2]);
        

    //polygons
    var polys = svg.selectAll("dot")
                    .data(polygonArray.filter(function(d){
                        return d[4] == curentWindow
                    }))
                    .enter()
                    .append("polygon")
                    .attr("points", d => d[0])
                    .attr("fill-opacity", d => d[2])
                    .attr("fill", d => d[3])
                    .on("click", d => polyClicked(d));
    
    
}

//when the polygon is clicked, go to new window
function polyClicked(d){
    curentWindow = d[1]
    update();
}

//manualy go to a new window
function goToWindow(){
    var input = document.getElementById("WindowTextBox");
    curentWindow = parseInt(input.value, 10)
    update()
}