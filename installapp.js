
installPrompt = null;

//window.addEventListener('DOMContentLoaded', function() {
  // handle the install event, if browser supports it
  const installButton = document.querySelector("#installapp");
  if (installButton)
  {
    window.addEventListener("beforeinstallprompt", (event) => {  // event fires if website can be installed as pwa
      event.preventDefault();
      installPrompt = event; // install event
      installButton.removeAttribute("hidden");
    });

    // handle install button click
    installButton.addEventListener("click", async () => {
      if (!installPrompt) {  // return if beforeinstallpromptevent is null
        return;
      }
      
      installPrompt.prompt().then( (res) => { // asks user to install app
              if (res.outcome == "accepted") // user chose to install app
              disableInAppInstallPrompt(); // remove install button
      });  
    });
  }

//});

function disableInAppInstallPrompt() {
    installPrompt = null;
    installButton.setAttribute("hidden", "");
}

window.addEventListener('load', () => {
    registerSW(); // on page load, register service worker
});

// Register the Service Worker
async function registerSW() 
{
    if ('serviceWorker' in navigator) {
    try {
    await navigator
            .serviceWorker
            .register('serviceworker.js');
    }
    catch (e) {
    console.log('SW registration failed');
    }
}
}