async function appLoad(scripts = [])
{
    addLink("manifest", "manifest.json");
    addLink("apple-touch-icon", "/icons/ios.png");
    addStylesheet("https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.rtl.min.css");
    addStylesheet("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
    addStylesheet("main.css");
    await addScript("libs/errors.js");
    await addScript("libs/installapp.js");
    await addScript("libs/filesys.js");
    await addScript("libs/lists.js");
    await addScript("https://code.jquery.com/jquery-3.7.1.min.js");
    await addScript("https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js");
    for (const script of scripts)
        await addScript(script);
    
    $( () => {
        setupAppInstall();
        $("body").css("direction", "rtl");
        $("body").css("display", "block");
        return true;
    });
}

async function addScript(scripturl, cb = null)
{
    let prom = new Promise(function(resolve, reject)
    {
        var script = document.createElement("script");  // create a script DOM node
        script.src = scripturl;  // set its src to the provided URL
        script.onload = () => { resolve(); if (cb != null) cb(); }	// onload is executed when script has finished loading
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });

    return prom;
}

function addLink(rel, url)
{
    var link = document.createElement("link");  // create a script DOM node
    link.rel = rel;
    link.href = url;  // set its src to the provided URL
    document.head.appendChild(link);
}

function addStylesheet(url)
{
    var css = document.createElement("link");  // create a script DOM node
    css.rel = "stylesheet";
    css.href = url;  // set its src to the provided URL
    document.head.appendChild(css);
}