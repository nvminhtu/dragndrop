    // Global variables
    var width, height;
    
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;

    // func00: resize canvas
    function resize() {
        var canvas = document.getElementById('container');
        var canvasRatio = canvas.height / canvas.width;
        var windowRatio = window.innerHeight / window.innerWidth;
        var width;
        var height;

        if (windowRatio < canvasRatio) {
            height = window.innerHeight;
            width = height / canvasRatio;
        } else {
            width = window.innerWidth;
            height = width * canvasRatio;
        }

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    };
    window.addEventListener('resize', resize, false);

    // func01: load Images to Screen
    function loadImages(sources, callback) {
        var assetDir = 'assets/';
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        
        for(var src in sources) {
            numImages++;
        }

        for(var src in sources) {
            images[src] = new Image();
            images[src].onload = function() {
                if(++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[src].src = assetDir + sources[src];
        }
    }

    //func02: Check canvas is nearby or not
    function isNearOutline(animal, outline) {
        var a = animal;
        var o = outline;
        var ax = a.getX();
        var ay = a.getY();

        if(ax > o.x - 20 && ax < o.x + 20 && ay > o.y - 20 && ay < o.y + 20) {
            return true;
        }
        else {
            return false;
        }
    }

    // func03: Draw Background in Canvas
    function drawBackground(background, beachImg, text) {
        var context = background.getContext();
        //context.drawImage(beachImg, 0, 0);
        //context.fill(beachImg,0,0);
        context.fillStyle = 'red';
        context.fill();
        context.setAttr('font', '20pt Calibri');
        context.setAttr('textAlign', 'center');
        context.setAttr('fillStyle', 'white');

        context.canvas.width =  winWidth;
        context.canvas.height = winHeight;
        // string: alert
        context.fillText(text, background.getStage().getWidth() / 2, 40);
    }

    // func04: init Konva JS
    function initStage(images) {
        var stage = new Konva.Stage({
            container: 'container',
            width: winWidth,
            height: winHeight
        });
        var background = new Konva.Layer();
        var animalLayer = new Konva.Layer();
        var animalShapes = [];
        var score = 0;

        // calucate for positions - responsive
        var snake_x = ( winWidth / 2 ) * (10 / 100),
            snake_y = ( winHeight ) * 10 / 100;

        // image positions
        var animals = {
            snake: {
                x: snake_x,
                y: snake_y
            },
            giraffe: {
                x: 90,
                y: 70
            },
            monkey: {
                x: 275,
                y: 70
            },
            lion: {
                x: 400,
                y: 70
            }
        };

        var outlines = {
            snake_black: {
                x: 20,
                y: 350
            },
            giraffe_black: {
                x: 390,
                y: 250
            },
            monkey_black: {
                x: 300,
                y: 420
            },
            lion_black: {
                x: 100,
                y: 390
            }
        };

        // bound inside a circle - no over of game screen
        var yellowGroup = new Konva.Group({
            x: stage.getWidth() / 2,
            y: 70,
            draggable: true,
            dragBoundFunc: function(pos) {
                var x = stage.getWidth() / 2;
                var y = 70;
                var radius = 50;
                var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
                if(scale < 1)
                    return {
                        y: Math.round((pos.y - y) * scale + y),
                        x: Math.round((pos.x - x) * scale + x)
                    };
                else
                    return pos;
            }
        });

        // create draggable animals
        for(var key in animals) {
            // anonymous function to induce scope
            (function() {
                var privKey = key;
                var anim = animals[key];

                var animal = new Konva.Image({
                    image: images[key],
                    x: anim.x,
                    y: anim.y,
                    draggable: true
                });

                // add canvas to group
                yellowGroup.add(animal);

                animal.on('dragstart', function() {
                    this.moveToTop();
                    animalLayer.draw();
                });

                // check if drop item 
                animal.on('dragend', function(event) {
                       

                });

                /*
                   * check if animal is in the right spot and
                   * snap into place if it is
                */

                animal.on('dragend', function(event) {
                    
                    var end_x = event.target._lastPos.x,
                        end_y = event.target._lastPos.y; 
                    
                    var max_x = winWidth - 10;
                    var max_y = winHeight - 10;

                    console.log(end_x);
                    console.log(end_y);
                    console.log(winWidth);
                    console.log(winHeight);

                    if(end_x < (winWidth-20) && end_y < (winHeight -20)) {
                        var outline = outlines[privKey + '_black'];
                        if(!animal.inRightPlace && isNearOutline(animal, outline)) {
                            animal.position({
                                x : outline.x,
                                y : outline.y
                            });
                            animalLayer.draw();
                            animal.inRightPlace = true;

                            if(++score >= 1) {
                                var text = 'You win! Enjoy your booty!';
                                drawBackground(background, images.beach, text);
                            }

                            // disable drag and drop
                            setTimeout(function() {
                                animal.draggable(false);
                            }, 50);
                        }
                    } else {
                        var outline = outlines[privKey + '_black'];
                        animal.position({
                            x : outline.x - 20,
                            y : outline.y - 30
                        });
                        animalLayer.draw();
                    }
                  
                });
                // make animal glow on mouseover
                animal.on('mouseover', function() {
                    animal.image(images[privKey + '_glow']);
                    animalLayer.draw();
                    document.body.style.cursor = 'pointer';
                });
                // return animal on mouseout
                animal.on('mouseout', function() {
                    animal.image(images[privKey]);
                    animalLayer.draw();
                    document.body.style.cursor = 'default';
                });

                animal.on('dragmove', function() {

                    document.body.style.cursor = 'pointer';
                });

                animalLayer.add(animal);
                animalShapes.push(animal);
            })();
        }

        // create animal outlines
        for(var key in outlines) {
            // anonymous function to induce scope
            (function() {
                var imageObj = images[key];
                var out = outlines[key];

                var outline = new Konva.Image({
                    image: imageObj,
                    x: out.x,
                    y: out.y
                });

                animalLayer.add(outline);
            })();
        }

        animalLayer.add(yellowGroup);
        stage.add(background);
        stage.add(animalLayer);
        
        
        drawBackground(background, images.beach, 'Ahoy! Put the animals on the beach!');
    }

    var sources = {
        beach: 'beach.png',
        snake: 'snake.png',
        snake_glow: 'snake-glow.png',
        snake_black: 'snake-black.png'
        // lion: 'lion.png',
        // lion_glow: 'lion-glow.png',
        // lion_black: 'lion-black.png',
        // monkey: 'monkey.png',
        // monkey_glow: 'monkey-glow.png',
        // monkey_black: 'monkey-black.png',
        // giraffe: 'giraffe.png',
        // giraffe_glow: 'giraffe-glow.png',
        // giraffe_black: 'giraffe-black.png'
    };
    loadImages(sources, initStage);
