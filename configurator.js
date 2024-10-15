function reconfigure(config){
    let strings = config.strings[config.lang]
    for(let [key, value] of Object.entries(strings)){
        element = document.getElementById(key);
        if(element)
            element.innerHTML = value;
    }
}