document.addEventListener("DOMContentLoaded", function(){
    //========================= INIT AUDIO
    let bufferSize = 256;

    let frequence = 0;
    let amplitude = 0;
    let maxAmplitude = 0;


    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function(stream) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
            mediaStream = context.createMediaStreamSource(stream);
            let numberOfInputChannels = 2;
            let numberOfOutputChannels = 2;
            if (context.createScriptProcessor) {
                recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            } else {
                recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            }

            recorder.onaudioprocess = function (e) {
                let chanl = e.inputBuffer.getChannelData(0);
                let chanr = e.inputBuffer.getChannelData(1);
                amplitude = 0;
                frequence = 0;
                let mem = 0;
                let l = 0;
                let r = 0;
                for (let i in chanl) {
                    l = chanl[i];
                    r = chanr[i];
                    amplitude += Math.abs(l)+Math.abs(r);
                    if ((l<0 && mem>0) || (l>0 && mem<0))
                        frequence++;
                    mem = l;
                }
                if (maxAmplitude<amplitude)
                    maxAmplitude = amplitude;
                console.log(maxAmplitude)
            }
            mediaStream.connect(recorder);
            recorder.connect(context.destination);

        }).catch(function(err) {
        console.log("Stream not OK");

    });

    //========================= INIT FREQUENCY
    //Récupère les frequences dans un tableau
    audio = document.querySelector("audio");
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    // audio.play();
    frequencyData = new Uint8Array(analyser.frequencyBinCount);

    //========================= INIT ELEMENTS
    let canvas = document.querySelector("canvas");
    let c = canvas.getContext("2d");
    let body = document.querySelector("body");

    CanvasRenderingContext2D.globalCompositeOperation = 'destination-out';

    let rect = body.getBoundingClientRect();

    canvas.style.backgroundColor = '#4A4E54';

    canvas.width = rect.width;
    canvas.height = rect.height;

    let w = canvas.width;
    let h = canvas.height;

    //========================= INIT TAB
    let tab = [];
    let tabPart = [];

    //========================= MOUSE
    let mouse = {
        x:null,
        y:null
    };
    body.addEventListener('mousemove', function(event){
        mouse.x = event.pageX;
        mouse.y = event.pageY;
    });

    let number = 0;

    //execute la fonction dans le temps imparti ne fonction de la charge
    window.requestAnimationFrame(draw);

    //========================= BOUCLE
    function draw(){
        analyser.getByteFrequencyData(frequencyData);
        let sum1 = 0;
        let sum2 = 0;
        let sum3 = 0;
        let sum4 = 0;
        let sum5 = 0;

        c.clearRect(0,0,w,h);

        //MUSIC
        c.fillStyle = "#000000";

        let i = 0;
        for(i; i < frequencyData.length/5; i++){
            sum1 = sum1 + frequencyData[i];
        }
        for(i; i < (frequencyData.length/5)*2; i++){
            sum2 = sum2 + frequencyData[i];
        }
        for(i; i < (frequencyData.length/5)*3; i++){
            sum3 = sum3 + frequencyData[i];
        }
        for(i; i < (frequencyData.length/5)*4; i++){
            sum4 = sum4 + frequencyData[i];
        }
        for(i; i < (frequencyData.length/5)*5; i++){
            sum5 = sum5 + frequencyData[i];
        }

        //Add in tab
        if(sum1 > 4100 && sum1 < 4200){
            let circle = createCircle(getRandomColor(true), true, false);
            tab.push(circle);
        }
        if(sum2 > 700 && sum2 < 1000){
            let circle = createCircle(getRandomColor(false), true, false);
            tab.push(circle);
        }
        if(sum5 > 1050 && sum5 < 1200){
            let circle = createCircle('rgba(70,73,79,0.1)', false, false);
            tab.push(circle);
        }

        //DRAW
        for(let i in tab){
            let circle = tab[i];
            //Test circle particles
            if(circle.appear){
                c.beginPath();
                c.fillStyle = circle.color;
                c.arc(circle.x,circle.y,circle.r,circle.sa,circle.ea);
                c.fill();
            }
            if(circle.appear && circle.r <= circle.rmax)
                circle.r++;
            if(circle.r >= circle.rmax)
                circle.appear = false;
            if(!circle.appear){
                for(let i in circle.particules){
                    let part = circle.particules[i];
                    if(part.appear){
                        c.beginPath();
                        c.fillStyle = part.color;
                        c.arc(part.x,part.y,part.size,circle.sa,circle.ea);
                        c.fill();
                    }

                    if(part.x < 0 || part.x > w || part.y < 0 || part.y > h){
                        part.appear = false;
                    }

                    part.x += part.speed*part.directionx;
                    part.y += part.speed*part.directiony;
                }
            }
        }

        window.requestAnimationFrame(draw);
    }

    function createCircle(color, particules, big){
        let rnumber = getRandomInInterval(0,50);
        let rmaxnumber = getRandomInInterval(rnumber,180);
        let xnumber = getRandomInInterval(0,w-rnumber);
        let ynumber = getRandomInInterval(0,h-rnumber);
        return {
            x:big?w/2:xnumber,
            y:big?h/2:ynumber,
            r:rnumber,
            sa:0,
            ea:Math.PI*2,
            rmax:big?w/2:rmaxnumber,
            color:big?'red':color,
            appear:true,
            particules:particules?getParticules(xnumber,ynumber,rnumber,color,big?w/2:rmaxnumber):[]
        };
    }

    function createParticules(xnumber,ynumber,rnumber,color){
        let sizenumber = getRandomInInterval(5,rnumber);
        return {
            x:xnumber,
            y:ynumber,
            size:sizenumber,
            speed:sizenumber/2,
            color:color,
            directionx:getRandomInInterval(-1,1),
            directiony:getRandomInInterval(-1,1),
            appear:true
        }
    }

    function getParticules(xnumber,ynumber,rnumber,color, rnumbermax){
        let tabparticules = [];
        for(let i = 0; i < Math.floor(rnumbermax/20);i++){
            tabparticules.push(createParticules(xnumber,ynumber,rnumber,color));
        }
        return tabparticules;
    }

    function getRandomInInterval(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomColor(root){
        let colors = [];
        let opacity = 0;
        if(root){
            colors = [
                "rgba(204,93,129,",
                "rgba(147,171,191,"
            ];
            opacity = getRandomInInterval(0.4,1);
        }else{
            colors = [
                "rgba(255,189,134,",
                "rgba(151,232,142,"
            ];
            opacity = getRandomInInterval(0.2,0.6);
        }

        return  colors[Math.floor(getRandomInInterval(0,colors.length))] += opacity + ')';
    }
})