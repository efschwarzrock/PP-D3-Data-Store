//array of picture elements
var pictureArray = []
//x,y,width,window,path

//array of polygons
var polygonArray = []
//[[arrayOfPoints], wheretoo, opacity, color, window, index]

//the variables to put in for color opacity and where to
var polygonVariables = ["#000000","1","1"]

//the curntly selected polygon
var editingPoly = -1

//which picture are we editing
var editingPic = -1

//array for the 2 movement boxes
var editArr = [[1],[2]]

    //is dragging started
    var dragging = -1

    //width of the edit boxes
    var editBoxWidth = 30


//The curent window we are on
var curentWindow = 0;

//if we are curently making a polygon
var makingPolygon = false;

//width of the svg
var BGWIDTH = 1500;

//height of the svg
var BGHEIGHT = 3000;

//if the UI is at the top
var UItop = true;

//the ui's height
var uiHeight = 50;

//whether to display the polygon expanded UI
var polygonUI = false;
//bug fixing
var polygonUITwo = false;

//bug fixing for the plygon add button
var firstClick = false;

//Which text field is being typed to
var typedTo = -1

//the text box we are typing to
var typedToElm = null

//the key board input for the extended ui
var inputstring = ["#000000","1","1"]

//the number of windows used
var numWindows = 0;


//loads the csv files into an array, so we can manipulate the data
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
            render(0) 
        })
    })
}

function update( w ){
    d3.select("svg").remove();
    polygonUI = polygonUITwo;
    render(w);
}


//updates the screan
//w is the window to display
function render( w ){

    
     // append the svg object to the body of the page
     var svg = d3.select("#screen")
     .append("svg")
     .attr("width", BGWIDTH)
     .attr("height", BGHEIGHT)
     .attr("fill", "#00ff00")
     .attr("background", "#00ff00");

     //takes in keyboard input
     d3.select("body")
    .on("keyup", function() {
            if(d3.event.key == "Backspace" && inputstring[typedTo] != ""){
                inputstring[typedTo] = inputstring[typedTo].substring(0,inputstring[typedTo].length-1)
            }else if(d3.event.key.length == 1){
                inputstring[typedTo] = inputstring[typedTo] + d3.event.key
            }
            if(editingPoly != -1){
                updateExpUI(svg);
            }
    });
     
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
        .attr("width", d => d[2])
        .on("click", d => makeEditBoxes(d));


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
                    .attr("stroke", "#112131")
                    .attr("stroke-width", function(d){
                        if(d[5] == editingPoly){
                            return 10
                        }else{
                            return 0
                        }
                    })
                    .attr("stroke-opacity", function(d){
                        if(d[2]<.75){
                            return 1
                        }else{
                            return d[2]
                        }
                    })
                    .on("click", d => polyClicked(d))
                    .on("dblclick", d => polyDblClicked(d));


    renderEditBoxes(svg);


     

    makeUI(svg);

    //checks if it is scrolling
    window.addEventListener("scroll", function(e) {scrolling(e, svg)})

    
    
}

//makes the UI for the polygons and images
function makeUI(svg){
    //the black background
   var UIBG = svg.selectAll("rect.UIBG")
       .data([7])
       .enter()
       .append("rect")
       .attr("class", "ui")
       .attr("x", 0)
       .attr("y", function(d){if(UItop){
                                return document.body.scrollTop-d;
                            }else{
                                return document.body.scrollTop-d-5-uiHeight + window.innerHeight;
        }})
       .attr("width", "100%")
       .attr("height", uiHeight)
       .attr("fill", "#000000");

    //down button
    var UIDWN = svg.selectAll("rect.UIBG")
       .data([7])
       .enter()
       .append("rect")
       .attr("class", "ui")
       .attr("x", BGWIDTH*.9)
       .attr("y", function(d){if(UItop){
                                return document.body.scrollTop-d;
                            }else{
                                return document.body.scrollTop-d-5-uiHeight + window.innerHeight;
        }})
       .attr("width", "10%")
       .attr("height", uiHeight)
       .attr("fill", "#ffff00")
       .on("click", d => uiFlip(d, svg));

       svg.append("text")
       .attr("class", "ui")
       .attr("font-size", uiHeight/2)
       .attr("x", BGWIDTH*.92)
       .attr("y", function(d){if(UItop){
                                return uiHeight*.6 + document.body.scrollTop
                            }else{
                                return document.body.scrollTop + window.innerHeight - uiHeight*.6
                            }})
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("Down")
       .on("click", d => uiFlip(d, svg));  

    renderStartAndStopPolyBtns(svg)

    renderDeletePolyBtn(svg)


    renderExpandPolyUIBtn(svg)

    renderDeleteImageBtn(svg)

    renderExpandedUI(svg)


}

//renders the edit boxes
function renderEditBoxes(svg){
    //edit boxes
    //movement
    var editPos = svg.selectAll("rect.move")
        .data(editArr)
        .enter()
        .append("rect")
        .attr("class", "ebp")
        .attr("x", function(d){
            if(editingPic == -1){
                return -100;
            }else{
                return pictureArray[editingPic][0] + pictureArray[editingPic][2]/2;
            }
        })
        .attr("y", function(d){
            if(editingPic == -1){
                return -100;
            }else{
                return pictureArray[editingPic][1];
            }
        })
        .attr("width", editBoxWidth)
        .attr("height", editBoxWidth)
        .attr("fill", "#505050")
        .on("mousedown", function(d){mouseDownEvent(1, svg)})
        .on("mousemove", function(d){if(dragging == 1) {mouseDragEvent(1, svg)}})
        .on("mouseup", function(d){mouseUpEvent(1)});

    //width
    var editWidth = svg.selectAll("rect.width")
        .data(editArr)
        .enter()
        .append("rect")
        .attr("class", "ebw")
        .attr("x", function(d){
            if(editingPic == -1){
                return -100;
            }else{
                return Number(pictureArray[editingPic][0]) + Number(pictureArray[editingPic][2]) - editBoxWidth;
            }
        })
        .attr("y", function(d){
            if(editingPic == -1){
                return -100;
            }else{
                return Number(pictureArray[editingPic][1])+50;
            }
        })
        .attr("width", editBoxWidth)
        .attr("height", editBoxWidth)
        .attr("fill", "#505050")
        .on("mousedown", function(d){mouseDownEvent(2, svg)})
        .on("mousemove", function(d){if(dragging == 2) {mouseDragEvent(2, svg)}})
        .on("mouseup", function(d){mouseUpEvent(2)});
}

function renderDeleteImageBtn(svg){
    
    //the delete image button
    var UIPic = svg.selectAll("rect.UIBG")
       .data([7])
       .enter()
       .append("rect")
       .attr("class", "ui")
       .attr("x", BGWIDTH*.70-5)
       .attr("y", function(d){if(UItop){
                                return document.body.scrollTop-d;
                            }else{
                                return document.body.scrollTop-d-5-uiHeight + window.innerHeight;
        }})
       .attr("width", "20%")
       .attr("height", uiHeight)
       .attr("fill", "#ffff00")
       .on("click", function(d){deleteImage()}); 

    svg.append("text")
       .attr("class", "ui")
       .attr("font-size", uiHeight/2)
       .attr("x", BGWIDTH*.70)
       .attr("y", function(d){if(UItop){
                                return uiHeight*.6 + document.body.scrollTop
                            }else{
                                return document.body.scrollTop + window.innerHeight - uiHeight*.6
                            }})
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("Delete Image")
       .on("click", function(d){deleteImage()}); 
}

function renderStartAndStopPolyBtns(svg){
    
    //the start polygon button
    var UIStaryPolygon = svg.selectAll("rect.UIBG")
       .data([7])
       .enter()
       .append("rect")
       .attr("class", "ui")
       .attr("x", 5)
       .attr("y", function(d){if(UItop){
                                return document.body.scrollTop-d;
                            }else{
                                return document.body.scrollTop-d-5-uiHeight + window.innerHeight;
        }})
       .attr("width", "16%")
       .attr("height", uiHeight)
       .attr("fill", "#ffff00")
       .on("click", function(d){addPoly()});

       svg.append("text")
       .attr("class", "ui")
       .attr("font-size", uiHeight/2)
       .attr("x", 10)
       .attr("y", function(d){if(UItop){
                                return uiHeight*.6 + document.body.scrollTop
                            }else{
                                return document.body.scrollTop + window.innerHeight - uiHeight*.6
                            }})
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("Start Polygon")
       .on("click", function(d){addPoly()}); 

    //the end polygon button
       var UIEndPolygon = svg.selectAll("rect.UIBG")
       .data([7])
       .enter()
       .append("rect")
       .attr("class", "ui")
       .attr("x", 10+BGWIDTH*.16)
       .attr("y", function(d){if(UItop){
                                return document.body.scrollTop-d;
                            }else{
                                return document.body.scrollTop-d-5-uiHeight + window.innerHeight;
        }})
       .attr("width", "16%")
       .attr("height", uiHeight)
       .attr("fill", "#ffff00")
       .on("click", function(d){stopPoly()});

       svg.append("text")
       .attr("class", "ui")
       .attr("font-size", uiHeight/2)
       .attr("x", 15+BGWIDTH*.16)
       .attr("y", function(d){if(UItop){
                                return uiHeight*.6 + document.body.scrollTop
                            }else{
                                return document.body.scrollTop + window.innerHeight - uiHeight*.6
                            }})
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("End Polygon")
       .on("click", function(d){stopPoly()}); 
}


function renderDeletePolyBtn(svg){
    
    //the end polygon button
    var UIDeletePolygon = svg.selectAll("rect.UIBG")
    .data([7])
    .enter()
    .append("rect")
    .attr("class", "ui")
    .attr("x", 15+BGWIDTH*.32)
    .attr("y", function(d){if(UItop){
                             return document.body.scrollTop-d;
                         }else{
                             return document.body.scrollTop-d-5-uiHeight + window.innerHeight;
     }})
    .attr("width", "20%")
    .attr("height", uiHeight)
    .attr("fill", "#ffff00")
    .on("click", function(d){deletePolygon()});

    svg.append("text")
    .attr("class", "ui")
    .attr("font-size", uiHeight/2)
    .attr("x", 20+BGWIDTH*.32)
    .attr("y", function(d){if(UItop){
                             return uiHeight*.6 + document.body.scrollTop
                         }else{
                             return document.body.scrollTop + window.innerHeight - uiHeight*.6
                         }})
    .style("text-anchor", "right")
    .style("fill", "#000000")
    .text("Delete Polygon")
    .on("click", function(d){deletePolygon()}); 
}


function renderExpandPolyUIBtn(svg){
    //the button for more UI
    var UIMorePolygon = svg.selectAll("rect.UIBG")
    .data([7])
    .enter()
    .append("rect")
    .attr("class", "ui")
    .attr("x", 20+BGWIDTH*.52)
    .attr("y", function(d){if(UItop){
                             return document.body.scrollTop-d;
                         }else{
                             return document.body.scrollTop-d-5-uiHeight + window.innerHeight;
     }})
    .attr("width", 53)
    .attr("height", uiHeight)
    .attr("fill", "#ffff00")
    .on("click", function(d){
        polygonUI = true
        polygonUITwo = true
        update();
    });

    svg.append("text")
    .attr("class", "uisp")
    .attr("font-size", uiHeight*1.5)
    .attr("x", 25+BGWIDTH*.52)
    .attr("y", function(d){if(UItop){
                             return uiHeight*.95 + document.body.scrollTop
                         }else{
                             return document.body.scrollTop + window.innerHeight - uiHeight*.25
                         }})
    .style("text-anchor", "right")
    .style("fill", "#000000")
    .text("=")
    .on("click", function(d){
        polygonUI = true
        polygonUITwo = true
        update();
    }); 
}

function renderExpandedUI(svg){
    var x = 20+BGWIDTH*.52
        var y = 100
    if(polygonUI){
        y = document.body.scrollTop+45;
    }else{
        var x = -1000
        var y = -1000
    }
    //the background
    var UIMorePolygon = svg.selectAll("rect.EXPUI")
    .data([7])
    .enter()
    .append("rect")
    .attr("class", "ExpUi")
    .attr("x", x)
    .attr("y", y)
    .attr("width", 235)
    .attr("height", 170)
    .attr("fill", "#ff0050");

    //enter button
    var UIMorePolygon = svg.selectAll("rect.EXPUIENT")
    .data([7])
    .enter()
    .append("rect")
    .attr("class", "ExpUi")
    .attr("x", x + 170)
    .attr("y", y + 135)
    .attr("width", 65)
    .attr("height", 35)
    .attr("fill", "#ffff00")
    .on("click", function(d){
        polygonVariables[0] = inputstring[0]
        polygonVariables[1] = inputstring[1]
        polygonVariables[2] = inputstring[2]
        if(editingPoly != -1){
            polygonArray[editingPoly][3] = inputstring[0]
            polygonArray[editingPoly][2] = inputstring[1]
            polygonArray[editingPoly][1] = inputstring[2]
            update()
        }
    });

    svg.append("text")
       .attr("class", "ExpUi")
       .attr("font-size", uiHeight/2)
       .attr("x", x + 175)
       .attr("y", y + 160)
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("Enter")
       .on("click", function(d){
        polygonVariables[0] = inputstring[0]
        polygonVariables[1] = inputstring[1]
        polygonVariables[2] = inputstring[2]
        if(editingPoly != -1){
            polygonArray[editingPoly][3] = inputstring[0]
            polygonArray[editingPoly][2] = inputstring[1]
            polygonArray[editingPoly][1] = inputstring[2]
            update()
        }
       }); 

    //color
    var colorElm = svg.append("text")
        .attr("class", "ExpUi")
        .attr("font-size", uiHeight/2)
        .attr("x", x + 10)
        .attr("y", y + 60)
        .style("text-anchor", "right")
        .style("fill", "#000000")
        .text(inputstring[0])
        .on("click", function(e){
            inputstring[0] = "#"
            typedTo = 0
            typedToElm = colorElm
        });



       svg.append("text")
       .attr("class", "ExpUi")
       .attr("font-size", uiHeight/2)
       .attr("x", x + 40)
       .attr("y", y + 30)
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("Fill")
       .on("click", function(e){
           inputstring[0] = "#"
           typedTo = 0
           typedToElm = colorElm
       });

       




       //opacity
    var OpacElm = svg.append("text")
       .attr("class", "ExpUi")
       .attr("font-size", uiHeight/2)
       .attr("x", x + 160)
       .attr("y", y + 60)
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text(inputstring[1])
       .on("click", function(e){
            inputstring[1] = ""
            typedTo = 1
            typedToElm = OpacElm
        });



       svg.append("text")
       .attr("class", "ExpUi")
       .attr("font-size", uiHeight/2)
       .attr("x", x + 140)
       .attr("y", y + 30)
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("Opacity")
       .on("click", function(e){
            inputstring[1] = ""
            typedTo = 1
            typedToElm = OpacElm
        });

       


       //page link
    var linkElm = svg.append("text")
       .attr("class", "ExpUi")
       .attr("font-size", uiHeight/2)
       .attr("x", x + 10)
       .attr("y", y + 160)
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text(inputstring[2])
       .on("click", function(e){
            inputstring[2] = ""
            typedTo = 2
            typedToElm = linkElm
        });

       svg.append("text")
       .attr("class", "ExpUi")
       .attr("font-size", uiHeight/2)
       .attr("x", x + 10)
       .attr("y", y + 130)
       .style("text-anchor", "right")
       .style("fill", "#000000")
       .text("Page Link")
       .on("click", function(e){
            inputstring[2] = ""
            typedTo = 2
            typedToElm = linkElm
        });

       
}

function updateExpUI(svg){
   
    typedToElm.transition()
                .duration(1)
                .text(inputstring[typedTo])
}


function polyClicked(d){
    editingPoly = d[5];
    editingPic = -1;
    update();
}

function polyDblClicked(d){
    editingPoly = -1;
    editingPic = -1;
    curentWindow = d[1]
    update();
}

function deletePolygon(){
    var i = 0;
    while(i<polygonArray.length){
        polygonArray[i][5] = i
        if(i == editingPoly){
            polygonArray.splice(i, 1);
            editingPoly = -1;
        }else{
            i++;
        }
    }
    update()
}

function scrolling(e, svg){
    var ui = svg.selectAll("rect.ui")
    var uiTxt = svg.selectAll("text.ui")
    //the = sign, ui special
    var uiTxtSP = svg.selectAll("text.uisp")
    var expUITxt = svg.selectAll("text.ExpUi")
    var expUIRect = svg.selectAll("rect.ExpUi")
    if(polygonUI){
        polygonUITwo = false;
        expUITxt.transition()
                .duration(1)
                .attr("x", -1000)
        expUIRect.transition()
                .duration(1)
                .attr("x", -1000)
    }
    if(UItop){
            ui.transition()
                .duration(1)
                .attr("y", d => document.body.scrollTop-d)
            uiTxt.transition()
                .duration(1)
                .attr("y", uiHeight*.6 + document.body.scrollTop)
            uiTxtSP.transition()
                .duration(1)
                .attr("y", uiHeight*.95 + document.body.scrollTop)
    }else{
            ui.transition()
                .duration(1)
                .attr("y", d => document.body.scrollTop-d-5-uiHeight + window.innerHeight)
            uiTxt.transition()
                .duration(1)
                .attr("y", document.body.scrollTop + window.innerHeight - uiHeight*.6 )
            uiTxtSP.transition()
                .duration(1)
                .attr("y", document.body.scrollTop + window.innerHeight - uiHeight*.25 )
    }
}

function uiFlip(d, svg){
    UItop = !UItop
    scrolling(1, svg)
}




//starts the dragging logic
function mouseDownEvent(eb){
    dragging = eb
}

//ends the draging logic
function mouseUpEvent(eb){
    if(eb == 1){
        pictureArray[editingPic][0] = d3.event.pageX - pictureArray[editingPic][2]/2 - editBoxWidth/2 - 5
        pictureArray[editingPic][1] = d3.event.pageY - editBoxWidth/2 - 5
        dragging = -1
    }else{
        pictureArray[editingPic][2] = d3.event.pageX - pictureArray[editingPic][0] + editBoxWidth/2 - 5
        dragging = -1
    }
    update()
}

//middle drag logic
function mouseDragEvent(eb, svg){
    if(eb == 1){
        var boxes = svg.selectAll("rect.ebp")
        boxes.transition()
            .duration(1)
            .attr("x", d3.event.pageX - editBoxWidth/2 - 5)
            .attr("y", d3.event.pageY - editBoxWidth/2 - 5)
    }else{
        var boxes = svg.selectAll("rect.ebw")
        boxes.transition()
            .duration(1)
            .attr("x", d3.event.pageX - editBoxWidth/2 - 5)
    }
}

//makes the edit boxes for moving the pictures
function makeEditBoxes(d){
    editingPic = d[5]
    editingPoly = -1;
    update();
}

//adds an image getting the data from the txt box
function addImage(){
    var input = document.getElementById("addImageTextbox");
    var path = input.value;
    pictureArray.push([100, 100, 300, curentWindow, path, pictureArray.length])
    update()

}

//deletes the selected image
function deleteImage(){
    var i = 0;
    while(i<pictureArray.length){
        pictureArray[i][5] = i
        if(i == editingPic){
            pictureArray.splice(i, 1);
            editingPic = -1;
        }else{
            i++;
        }
    }
    update()
}

//console.log
function log(){
    console.log("herherher")
}

//when the svg is clicked
function clicked(){
    if(makingPolygon && !firstClick){
        var mx = event.pageX - 7;
        var my = event.pageY - 7;
        polygonArray[polygonArray.length - 1][0] = polygonArray[polygonArray.length - 1][0] + mx + "," + my + " ";
        update()
    }else if(firstClick){
        firstClick = false;
    }

}

//adds a polygon, or point to the polygon
function addPoly(){
    firstClick = true
    makingPolygon = true
    polygonArray.push(["", polygonVariables[2], polygonVariables[1], polygonVariables[0], curentWindow, polygonArray.length]);
}

//stops the polygon
function stopPoly(){
    makingPolygon = false
}




//button to click to load all the data into csvs
function save(){
    var linkPics = document.getElementById('downloadlinkPics');
    var linkPolygon = document.getElementById('downloadlinkPolygon');

    var picturesCsvData = makeCSVPictures()
    var polygonCsvData = makeCSVPolygon()

    linkPics.href = makeTextFile(picturesCsvData);
    linkPics.style.display = 'block';

    linkPolygon.href = makeTextFile(polygonCsvData);
    linkPolygon.style.display = 'block';
}

//makes the text part for the picture data
function makeCSVPictures(){
    var text = "X,Y,Width,Window,Path\n"
    var i = 0;
    while(i < pictureArray.length){
        text = text + pictureArray[i][0] + "," + pictureArray[i][1] + "," + pictureArray[i][2] + "," + pictureArray[i][3] + "," + pictureArray[i][4] + "\n"
        i++;
    }
    return text;
}

//makes the csv part for the text data
function makeCSVPolygon(){
    //[[arrayOfPoints], wheretoo, opacity, color, window, index]
    var text = "Points,WhereTo,Opacity,Color,Window\n"
    var i = 0;
    while(i < polygonArray.length){
        text = text + "\"" + polygonArray[i][0] + "\"" + "," + polygonArray[i][1] + "," + polygonArray[i][2] + "," + polygonArray[i][3] + "," + polygonArray[i][4] + "\n"
        i++;
    }
    return text;

}

//makes the actual text file
function makeTextFile(text) {
    var data = new Blob([text], { type: 'text/plain' });

    textFile = window.URL.createObjectURL(data);

    return textFile;
};

//makes the textbox capable of hitting the enter key
function loadHTMLElements(){
    var input = document.getElementById("addImageTextbox");

    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("addImgBtn").click();
        }
    });
}

function goToWindow(){
    var input = document.getElementById("WindowTextBox");
    curentWindow = parseInt(input.value, 10)
    update()
}