(async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !navigator.serviceWorker.controller) {
      await navigator.serviceWorker.register('/mock-cloudinary-worker.js');
      console.log('DEBUG: Image service worker registered, reloading.');
      window.location.reload();
    } else {
      console.log('DEBUG: Client is under the control of image service worker');
    }
  }
})();
