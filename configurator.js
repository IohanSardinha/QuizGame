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