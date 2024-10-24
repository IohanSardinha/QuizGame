function reconfigure(config){
    let strings = config.strings[config.lang]
    for(let [key, value] of Object.entries(strings)){
        element = document.getElementById(key);
        if(element)
            element.innerHTML = value;
    }
}

function getString(config, key){
    return config.strings[config.lang][key];
}

function loadConfig(config){
    const lang = localStorage.getItem("lang");
    if(lang !== null)
        config.lang = lang;

    const lang_select = document.getElementById("settings-languages");

    for(let key in config.strings){
        const option = document.createElement("option");
        option.innerHTML = key;
        option.value = key;
        if(key == config.lang)
            option.selected = true;
        lang_select.appendChild(option);
    }

    lang_select.onchange = ()=>{
        config.lang = lang_select.value
        localStorage.setItem("lang", config.lang)
        reconfigure(config)
    }
}

function brightnessByColor (color) {
    var color = "" + color, isHEX = color.indexOf("#") == 0, isRGB = color.indexOf("rgb") == 0;
    if (isHEX) {
      var m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g);
      if (m) var r = parseInt(m[0], 16), g = parseInt(m[1], 16), b = parseInt(m[2], 16);
    }
    if (isRGB) {
      var m = color.match(/(\d+){3}/g);
      if (m) var r = m[0], g = m[1], b = m[2];
    }
    if (typeof r != "undefined") return ((r*299)+(g*587)+(b*114))/1000;
  }